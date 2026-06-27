"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type OrganizationRole = "OWNER" | "TEACHER" | "STUDENT";

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function assertCanManageOrganization(userId: string, organizationId: string) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership || !["OWNER", "TEACHER"].includes(membership.role)) {
    throw new Error("ORGANIZATION_PERMISSION_DENIED");
  }

  return membership;
}

async function assertOrganizationOwner(userId: string, organizationId: string) {
  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId,
      },
    },
  });

  if (!membership || membership.role !== "OWNER") {
    throw new Error("ORGANIZATION_OWNER_PERMISSION_REQUIRED");
  }

  return membership;
}

export async function getOrganizationsForUser(userId: string) {
  if (!userId) throw new Error("USER_ID_MISSING");

  return prisma.organization.findMany({
    where: {
      members: {
        some: {
          userId,
        },
      },
    },
    include: {
      members: {
        include: {
          user: {
            select: {
              id: true,
              name: true,
              lastname: true,
              email: true,
            },
          },
        },
        orderBy: [{ role: "asc" }, { createdAt: "asc" }],
      },
      _count: {
        select: {
          events: true,
        },
      },
    },
    orderBy: {
      updatedAt: "desc",
    },
  });
}

export async function getOrganizationInviteOptions(organizationId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) throw new Error("UNAUTHORIZED");

  const membership = await prisma.organizationMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId,
        userId: session.user.id,
      },
    },
  });

  if (!membership) throw new Error("ORGANIZATION_MEMBERSHIP_REQUIRED");

  return prisma.organizationMember.findMany({
    where: { organizationId },
    select: {
      role: true,
      user: {
        select: {
          id: true,
          name: true,
          lastname: true,
          email: true,
        },
      },
    },
    orderBy: [{ role: "asc" }, { createdAt: "asc" }],
  });
}

export async function createOrganization(formData: FormData) {
  const ownerId = String(formData.get("ownerId") || "");
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim();

  if (!ownerId) throw new Error("USER_ID_MISSING");
  if (name.length < 2) throw new Error("ORGANIZATION_NAME_TOO_SHORT");

  const baseSlug = slugify(name) || "organization";
  const slug = `${baseSlug}-${crypto.randomUUID().slice(0, 8)}`;

  await prisma.organization.create({
    data: {
      name,
      slug,
      description: description || null,
      ownerId,
      members: {
        create: {
          userId: ownerId,
          role: "OWNER",
        },
      },
    },
  });

  revalidatePath("/organization");
}

export async function addOrganizationMember(formData: FormData) {
  const actorId = String(formData.get("actorId") || "");
  const organizationId = String(formData.get("organizationId") || "");
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const role = String(formData.get("role") || "STUDENT") as OrganizationRole;

  if (!actorId || !organizationId || !email) throw new Error("INVALID_MEMBER_INPUT");
  if (!["TEACHER", "STUDENT"].includes(role)) throw new Error("INVALID_ORGANIZATION_ROLE");

  await assertCanManageOrganization(actorId, organizationId);

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new Error("USER_NOT_FOUND");

  await prisma.organizationMember.upsert({
    where: {
      organizationId_userId: {
        organizationId,
        userId: user.id,
      },
    },
    create: {
      organizationId,
      userId: user.id,
      role,
    },
    update: {
      role,
    },
  });

  revalidatePath("/organization");
}

export async function removeOrganizationMember(formData: FormData) {
  const actorId = String(formData.get("actorId") || "");
  const organizationId = String(formData.get("organizationId") || "");
  const memberId = String(formData.get("memberId") || "");

  if (!actorId || !organizationId || !memberId) {
    throw new Error("INVALID_MEMBER_INPUT");
  }

  await assertOrganizationOwner(actorId, organizationId);

  const member = await prisma.organizationMember.findUnique({
    where: { id: memberId },
  });

  if (!member || member.organizationId !== organizationId) {
    throw new Error("ORGANIZATION_MEMBER_NOT_FOUND");
  }

  if (member.role === "OWNER") {
    throw new Error("ORGANIZATION_OWNER_CANNOT_BE_REMOVED");
  }

  await prisma.organizationMember.delete({
    where: { id: memberId },
  });

  revalidatePath("/organization");
}
