import { MouseEventHandler } from "react";
import { Button } from "../ui/button";

export const FormButtons = ({
  onCancel,
  onReset,
  onSubmit,
  saving,
}: {
  onCancel: () => void;
  onReset: () => void;
  onSubmit: MouseEventHandler<HTMLButtonElement>;
  saving: boolean;
}) => {
  return (
    <div className="flex gap-3 justify-end mb-4 px-3">
      <Button
        type="button"
        variant={"outline"}
        onClick={onCancel}
        disabled={saving}
      >
        Cancel
      </Button>
      <Button
        type="button"
        variant={"link"}
        onClick={onReset}
        disabled={saving}
      >
        Reset
      </Button>
      <Button type="button" onClick={onSubmit} disabled={saving}>
        {saving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};
