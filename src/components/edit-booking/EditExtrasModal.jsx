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
import { Checkbox } from "@/components/ui/checkbox";
import demoImg from "@/assets/Lakeside Serenity.png";

export default function EditExtrasModal({ open, onOpenChange, value, onSave }) {
  const EXTRAS = [
    {
      id: "decor",
      label: "Special Room Decor",
      price: 40000,
      desc: "Romantic setup with flowers, candles, and petals",
    },
    {
      id: "picnic",
      label: "Private Sunset Picnic",
      price: 35000,
      desc: "Curated picnic experience at our premium sunset spot",
    },
    {
      id: "drinks",
      label: "Premium Drinks Package",
      price: 55000,
      desc: "Selection of premium wines, spirits, and cocktails",
    },
    {
      id: "cake",
      label: "Premium Cactus Cake",
      price: 60000,
      desc: "Chocolate sponge cake",
    },
  ];

  const [selected, setSelected] = useState(new Set(value || []));
  const [note, setNote] = useState("");

  useEffect(() => setSelected(new Set(value || [])), [value, open]);

  const toggle = (id) => {
    setSelected((s) => {
      const copy = new Set([...s]);
      if (copy.has(id)) copy.delete(id);
      else copy.add(id);
      return copy;
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Your Extras
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-[#737373]">
            Edit special touches to your stay
          </p>

          <div className="space-y-3">
            {EXTRAS.map((e) => (
              <div
                key={e.id}
                className="border rounded-md p-3 bg-white flex items-start gap-3"
              >
                <img
                  src={demoImg}
                  alt={e.label}
                  className="w-20 h-14 object-cover rounded-md"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#09432B]">
                        {e.label}
                      </div>
                      <div className="text-xs text-[#737373]">{e.desc}</div>
                    </div>
                    <div className="text-sm font-semibold">
                      ₦{e.price.toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-2">
                    <label className="inline-flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={selected.has(e.id)}
                        onCheckedChange={() => toggle(e.id)}
                      />
                      <span className="text-sm text-[#4F4F4F]">Select</span>
                    </label>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-[#09432B] mb-1">
              Special Instructions
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Any notes about extras..."
              className="w-full border rounded-md px-3 py-2"
            />
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Go Back
          </Button>
          <div className="flex gap-2">
            <Button
              onClick={() => {
                onSave([...selected]);
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
