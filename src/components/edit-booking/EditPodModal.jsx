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
import demoImg from "@/assets/Lakeside Serenity.png";

export default function EditPodModal({ open, onOpenChange, value, onSave }) {
  const PODS = [
    {
      id: "pod-1",
      title: "Lakeside Serenity",
      price: 250000,
      available: true,
      img: demoImg,
    },
    {
      id: "pod-2",
      title: "Garden Estate",
      price: 250000,
      available: true,
      img: demoImg,
    },
    {
      id: "pod-3",
      title: "Hillside Escape",
      price: 250000,
      available: false,
      img: demoImg,
    },
    {
      id: "pod-4",
      title: "Forest Haven",
      price: 250000,
      available: true,
      img: demoImg,
    },
    {
      id: "pod-5",
      title: "Sunset Vista",
      price: 250000,
      available: true,
      img: demoImg,
    },
  ];

  const [selectedId, setSelectedId] = useState(value?.id ?? null);

  useEffect(() => setSelectedId(value?.id ?? null), [value, open]);

  const pick = () => {
    const picked = PODS.find((p) => p.id === selectedId) || value;
    onSave(picked);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Your Eco Pod
          </DialogTitle>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-[#737373]">Edit your perfect sanctuary</p>

          <div className="space-y-3">
            {PODS.map((p) => (
              <div
                key={p.id}
                className={`rounded-lg border ${
                  p.available ? "border-[#E6F2EE]" : "border-red-200"
                } bg-white p-3 flex items-center gap-4`}
              >
                <img
                  src={p.img}
                  alt={p.title}
                  className="w-20 h-14 object-cover rounded-md flex-shrink-0"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-semibold text-[#09432B]">
                        {p.title}
                      </div>
                      <div className="text-xs text-[#737373]">
                        {p.available
                          ? `₦${p.price.toLocaleString()} per person/night`
                          : "Unavailable"}
                      </div>
                      <div className="flex gap-2 mt-2 flex-wrap">
                        <span className="text-xs bg-[#E6F2EE] px-2 py-1 rounded-full text-[#09432B]">
                          Lake View
                        </span>
                        <span className="text-xs bg-[#E6F2EE] px-2 py-1 rounded-full text-[#09432B]">
                          Private Pool
                        </span>
                        <span className="text-xs bg-[#E6F2EE] px-2 py-1 rounded-full text-[#09432B]">
                          King Size Bed
                        </span>
                      </div>
                    </div>
                    <div>
                      <label className="inline-flex items-center gap-2 cursor-pointer">
                        <input
                          type="radio"
                          name="podSelect"
                          checked={selectedId === p.id}
                          disabled={!p.available}
                          onChange={() => setSelectedId(p.id)}
                          className="form-radio text-[#09432B] border-[#09432B]"
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            <div
              className="rounded-md p-3 border"
              style={{
                background:
                  "linear-gradient(135deg, rgba(181,171,132,0.08) 0%, rgba(161,146,87,0.08) 100%)",
              }}
            >
              <div className="text-sm font-semibold text-[#09432B] mb-1">
                Multi Room Assignment
              </div>
              <div className="text-sm text-[#444]">
                Select pods for each night based on availability
              </div>

              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm text-[#09432B] block mb-1">
                    Day 1
                  </label>
                  <select className="w-full border border-[#0F5B45] rounded-md px-3 py-2">
                    {PODS.map((p) => (
                      <option key={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm text-[#09432B] block mb-1">
                    Day 2
                  </label>
                  <select className="w-full border border-[#0F5B45] rounded-md px-3 py-2">
                    {PODS.map((p) => (
                      <option key={p.id + "-2"}>{p.title}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6 flex items-center justify-between">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Go Back
          </Button>
          <div className="flex gap-2">
            <Button onClick={pick} className="bg-[#09432B] text-white">
              Save Changes
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
