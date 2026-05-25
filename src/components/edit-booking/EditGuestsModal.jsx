import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function EditGuestsModal({ open, onOpenChange, value, onSave }) {
  const [local, setLocal] = useState(
    value || { adults: 2, teenagers: 0, infants: 0, toddlers: 0, children: 0 }
  );

  const change = (key, delta) => {
    setLocal((s) => {
      const next = { ...s, [key]: Math.max(0, (s[key] || 0) + delta) };
      return next;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Guest Details
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4 bg-white p-4 rounded-md">
          <div className="flex flex-col gap-4 items-center">
            <div className="w-full flex items-center justify-between">
              <div className="text-sm">Adults (18+ years)</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => change("adults", -1)}>
                  -
                </Button>
                <div className="min-w-[32px] text-center">{local.adults}</div>
                <Button variant="outline" onClick={() => change("adults", 1)}>
                  +
                </Button>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div className="text-sm">Teens (13-17 years)</div>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={() => change("teenagers", -1)}
                >
                  -
                </Button>
                <div className="min-w-[32px] text-center">
                  {local.teenagers}
                </div>
                <Button
                  variant="outline"
                  onClick={() => change("teenagers", 1)}
                >
                  +
                </Button>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div className="text-sm">Infants (0-1 year)</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => change("infants", -1)}>
                  -
                </Button>
                <div className="min-w-[32px] text-center">{local.infants || 0}</div>
                <Button variant="outline" onClick={() => change("infants", 1)}>
                  +
                </Button>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div className="text-sm">Toddlers (1-3 years)</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => change("toddlers", -1)}>
                  -
                </Button>
                <div className="min-w-[32px] text-center">{local.toddlers || 0}</div>
                <Button variant="outline" onClick={() => change("toddlers", 1)}>
                  +
                </Button>
              </div>
            </div>

            <div className="w-full flex items-center justify-between">
              <div className="text-sm">Children (4-12 years)</div>
              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={() => change("children", -1)}>
                  -
                </Button>
                <div className="min-w-[32px] text-center">{local.children}</div>
                <Button variant="outline" onClick={() => change("children", 1)}>
                  +
                </Button>
              </div>
            </div>
          </div>

          <div
            className="rounded-md p-3"
            style={{ backgroundColor: "#B7FFFF" }}
          >
            <div className="text-sm text-[#09432B] font-semibold">
              Age Policy
            </div>
            <div className="text-xs text-[#444] mt-1">
              Children aged 0-12 years are only permitted on a full camp
              takeover or on dates designated by the lodge.
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Go Back
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onSave(local);
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
