import type { User } from "@/types/user";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel, FieldLegend, FieldSet } from "@/components/ui/field";

type EditProfileGoalsProps = {
    userDetails?: User;
    setUserDetails: React.Dispatch<React.SetStateAction<User | undefined>>;
    errorMessage: string;
    successMessage: string;
    editing: boolean;
    setEditing: React.Dispatch<React.SetStateAction<boolean>>;
    saveChanges: () => Promise<void>;
};

export default function EditProfileGoals({
    userDetails,
    setUserDetails,
    errorMessage,
    successMessage,
    editing,
    setEditing,
    saveChanges,
}: EditProfileGoalsProps) {
    return (
        <div className="flex flex-col gap-4 md:w-1/2">
            <FieldSet>
                <FieldLegend variant="label">
                    What are you using LightHouse for?
                </FieldLegend>
                <FieldGroup className="gap-3">
                    <Field orientation="horizontal">
                        <Checkbox
                            className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                            id="buying-checkbox"
                            name="buying-checkbox"
                            checked={userDetails?.user_goals.includes("buying")}
                            onCheckedChange={(checked) => {
                                const updatedGoals = checked
                                    ? [...(userDetails?.user_goals || []), "buying"]
                                    : (userDetails?.user_goals || []).filter((goal) => goal !== "buying");
                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                            }}
                        />
                        <FieldLabel htmlFor="buying-checkbox" className="font-normal">
                            Buying
                        </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                        <Checkbox
                            className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                            id="selling-checkbox"
                            name="selling-checkbox"
                            checked={userDetails?.user_goals.includes("selling")}
                            onCheckedChange={(checked) => {
                                const updatedGoals = checked
                                    ? [...(userDetails?.user_goals || []), "selling"]
                                    : (userDetails?.user_goals || []).filter((goal) => goal !== "selling");
                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                            }}
                        />
                        <FieldLabel htmlFor="selling-checkbox" className="font-normal">
                            Selling
                        </FieldLabel>
                    </Field>
                    <Field orientation="horizontal">
                        <Checkbox
                            className="border-foreground text-foreground data-[state=checked]:text-white data-[state=checked]:border-foreground data-[state=checked]:bg-highlight"
                            id="browsing-checkbox"
                            name="browsing-checkbox"
                            checked={userDetails?.user_goals.includes("browsing")}
                            onCheckedChange={(checked) => {
                                const updatedGoals = checked
                                    ? [...(userDetails?.user_goals || []), "browsing"]
                                    : (userDetails?.user_goals || []).filter((goal) => goal !== "browsing");
                                setUserDetails({ ...userDetails, user_goals: updatedGoals } as User);
                            }}
                        />
                        <FieldLabel htmlFor="browsing-checkbox" className="font-normal">
                            Just Browsing
                        </FieldLabel>
                    </Field>
                </FieldGroup>
            </FieldSet>

            {errorMessage && <p className="text-red-600">{errorMessage}</p>}
            {successMessage && <p className="text-green-600">{successMessage}</p>}
            <Button
                onClick={() => {
                    setEditing(!editing);
                    if (editing) {
                        saveChanges();
                    }
                }}
                className="w-full sm:w-1/2 mt-8 bg-buttonColor text-foreground hover:bg-buttonHover"
            >
                Save Changes
            </Button>
        </div>
    );
}