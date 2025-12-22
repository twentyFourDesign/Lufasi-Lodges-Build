import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditMealPlanModal({
  open,
  onOpenChange,
  value,
  onSave,
}) {
  const [selected, setSelected] = useState(
    value?.mealPlan || { id: "", title: "Full Board" }
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Your Meal Plan
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-[#737373]">
            Choose a meal plan for your stay.
          </p>

          <div className="space-y-2">
            {value.availableMealPlans.map((p) => (
              <label
                key={p.id}
                className="flex items-center gap-3 border rounded-md px-3 py-2"
              >
                <input
                  type="radio"
                  name="meal"
                  checked={selected.title === p.title}
                  onChange={() => setSelected(p)}
                />
                <div>
                  <div className="text-sm font-semibold text-[#09432B]">
                    {p.title}
                  </div>
                  <div className="text-xs text-[#737373]">{p.subtitle}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Go Back
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onSave(selected);
                onOpenChange(false);
              }}
              className="bg-[#09432B] text-white"
            >
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
