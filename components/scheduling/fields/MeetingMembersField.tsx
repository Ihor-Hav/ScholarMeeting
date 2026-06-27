import { GraduationCap, UserRound, Users, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Controller } from "react-hook-form";
import { SchedualingFormValues } from "@/components/scheduling/SchedualingFields";
import { Field, FieldLabel, FieldError } from "@/components/ui/field";

const meetingMembers = [
  {
    value: "ONE_ON_ONE",
    label: "ONE ON ONE",
    icon: <UserRound />,
  },
  {
    value: "GROUP",
    label: "GROUP",
    icon: <Users />,
  },
  {
    value: "ORGANIZATION",
    label: "TEACHER/STUDENT",
    icon: <GraduationCap />,
  },
];

type Props = {
  form: SchedualingFormValues;
};

export default function MeetingMembersField({ form }: Props) {
  return (
    <Controller
      name="MeetingMembers"
      control={form.control}
      render={({ field, fieldState }) => (
        <Field>
          <FieldLabel>Meeting Members</FieldLabel>
          <div className="grid grid-cols-3 gap-2">
            {meetingMembers.map((item) => (
              <Label
                key={item.value}
                className={`relative p-4 flex flex-col justify-between items-center border-2 rounded-lg ${item.value === field.value ? "border-blue-500 bg-blue-400/10" : ""}`}
              >
                <Input
                  type="radio"
                  value={item.value}
                  checked={field.value === item.value}
                  onChange={() => {
                    field.onChange(item.value);
                    if (item.value === "ORGANIZATION") {
                      form.setValue("requiredHostRole", "TEACHER");
                      form.setValue("requiredGuestRole", "STUDENT");
                      form.setValue("bookingVisibility", "ORGANIZATION");
                    }
                  }}
                  className="absolute inset-0 invisible"
                ></Input>
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.value === field.value && (
                  <div className="absolute right-2 top-2 outline border w-4 h-4 rounded-full border-blue-500 bg-blue-500 flex justify-center items-center">
                    <Check className="text-white" size={20} />
                  </div>
                )}
              </Label>
            ))}
          </div>
          {fieldState.error && (
            <FieldError className="text-red-500">
              {fieldState.error.message}
            </FieldError>
          )}
        </Field>
      )}
    />
  );
}
