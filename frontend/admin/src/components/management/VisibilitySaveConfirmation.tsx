import Button from "@/components/ui/button/Button";

interface VisibilitySaveConfirmationProps {
  itemType: "category" | "topic";
  itemName: string;
  isActive: boolean;
  saving: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function VisibilitySaveConfirmation({
  itemType,
  itemName,
  isActive,
  saving,
  onCancel,
  onConfirm,
}: VisibilitySaveConfirmationProps) {
  const visibility = isActive ? "public" : "private";

  return (
    <div className="text-center">
      <h3 className="mb-2 text-lg font-semibold text-gray-800 dark:text-white/90">
        Confirm {visibility} save
      </h3>
      <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">
        Are you sure you want to save the {itemType} <strong>{itemName}</strong>{" "}
        {isActive ? "publicly" : "privately"}?
      </p>
      <div className="flex justify-center gap-3">
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancel
        </Button>
        <Button
          variant={isActive ? "primary" : "outline"}
          onClick={onConfirm}
          disabled={saving}
        >
          {saving ? "Saving..." : `Confirm ${visibility} save`}
        </Button>
      </div>
    </div>
  );
}
