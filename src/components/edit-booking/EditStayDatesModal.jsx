/* eslint-disable react-hooks/set-state-in-effect */
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

export default function EditStayDatesModal({
  open,
  onOpenChange,
  value,
  onSave,
  showPenaltyInfo = true,
}) {
  const [local, setLocal] = useState(
    value || {
      checkIn: "",
      checkOut: "",
      guests: "2 Guests",
    },
  );

  useEffect(
    () =>
      setLocal(
        value || {
          checkIn: "",
          checkOut: "",
          guests: "2 Guests",
        },
      ),
    [value, open],
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Stay Dates
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          {showPenaltyInfo && (
            <div
              className="rounded-md p-4 mb-2 text-[#09432B]"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                border: "1px solid rgba(181,171,132,0.35)",
              }}
            >
              <p className="text-sm font-semibold mb-1">Penalty Fee Added</p>
              <p className="text-sm">
                You have to pay a penalty fee of ₦25,000 for changing your stay
                dates.
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[#09432B] mb-1">
              Check-in
            </label>
            <Input
              value={local.checkIn}
              onChange={(e) => setLocal({ ...local, checkIn: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09432B] mb-1">
              Check-out
            </label>
            <Input
              value={local.checkOut}
              onChange={(e) => setLocal({ ...local, checkOut: e.target.value })}
              placeholder="DD/MM/YYYY"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09432B] mb-1">
              Guests
            </label>
            <Select
              value={local.guests}
              onValueChange={(v) => setLocal({ ...local, guests: v })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select guests" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2 Guests">2 Guests</SelectItem>
                <SelectItem value="3 Guests">3 Guests</SelectItem>
                <SelectItem value="4 Guests">4 Guests</SelectItem>
              </SelectContent>
            </Select>
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
