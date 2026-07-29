import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Home, Info } from "lucide-react";

import { Button } from "@/components/ui/button";

function formatPrice(n) {
  return n.toLocaleString();
}

export default function EditPodModal({ open, onOpenChange, value, onSave }) {
  const [roomCount, setRoomCount] = useState(value?.podCount || 0);
  // Count available pods
  const availablePodsCount = value.availablePods
    ? value.availablePods.filter((pod) => pod.available === true).length
    : 0;
  // Collect all unique tags from available pods
  const podTags = Array.from(
    new Set(
      (value.availablePods || [])
        .flatMap((pod) => (Array.isArray(pod.tags) ? pod.tags : []))
        .filter(Boolean)
    )
  );

  const pick = () => {
    console.log("Selected Room Count:", roomCount);
    onSave(roomCount);
    onOpenChange(false);
  };

  const onChangeRooms = (type) => {
    if (type === "dec" && roomCount > 1) {
      setRoomCount(roomCount - 1);
    } else if (type === "inc" && roomCount < availablePodsCount) {
      setRoomCount(roomCount + 1);
    }
  };

  useEffect(() => {
    console.log("room Count:", roomCount);
  }, [roomCount]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-[#09432B]">
            Edit Your Eco Pod
          </DialogTitle>
          <p className="text-sm text-[#737373]">Edit your perfect sanctuary</p>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div
            className="rounded-lg border border-[#C7C3B5] px-4 py-3 flex items-center gap-2 text-[#09432B]"
            style={{
              background:
                "linear-gradient(135deg, rgba(181,171,132,0.28) 0%, rgba(161,146,87,0.28) 100%)",
            }}
          >
            <Info className="w-4 h-4" />
            <span className="text-sm font-medium">
              You can only select the number of rooms that are currently
              available for your chosen dates.
            </span>
          </div>
          <Card className="bg-white rounded-xl shadow-sm overflow-hidden transition-all opacity-100 mt-5">
            <CardContent className="p-0">
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="w-8 h-8 rounded-full flex items-center justify-center"
                    style={{
                      background:
                        "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                      border: "1px solid rgba(181,171,132,0.35)",
                    }}
                  >
                    <Home className="w-4 h-4 text-[#09432B]" />
                  </div>
                  <h3 className="text-lg font-semibold text-[#09432B]">
                    Room selection
                  </h3>
                </div>

                <p className="text-sm text-[#737373] mt-1">
                  Wake up to stunning lake views with your private plunge pool
                  steps from your bed.
                </p>

                <div className="flex flex-wrap gap-2 mt-3">
                  {podTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-[#E6F2EE] text-[#09432B] px-3 py-1 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
                <div className="mt-3">
                  <span className="text-sm text-[#737373] font-bold whitespace-nowrap">
                    ₦{formatPrice(250000)}{" "}
                    <span className="font-normal">per person/night</span>
                  </span>
                </div>

                <div
                  className="flex flex-col items-center text-center rounded-md p-4 mt-3"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(181,171,132,0.18) 0%, rgba(161,146,87,0.18) 100%)",
                    border: "1px solid rgba(181,171,132,0.35)",
                  }}
                >
                  <span className="text-lg font-semibold text-[#09432B] pb-4">
                    Select the number of rooms
                  </span>

                  <div className="flex items-center gap-6 mt-4 sm:mt-0">
                    <button
                      onClick={() => onChangeRooms("dec")}
                      className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                    >
                      –
                    </button>

                    <span className="text-2xl font-bold text-[#09432B] w-8 text-center">
                      {roomCount}
                    </span>

                    <button
                      onClick={() => onChangeRooms("inc")}
                      className="w-12 h-12 rounded-full border-2 border-[#0F5B45] flex items-center justify-center text-[#0F5B45] text-xl"
                    >
                      +
                    </button>
                  </div>
                </div>
                <div className="rounded-lg border px-4 py-3 flex items-center justify-between gap-2 bg-[#E6F2EE] text-[#09432B] mt-5">
                  <span className="text-sm font-medium">Total:</span>
                  <span className="text-sm font-medium">
                    {`${roomCount}x${formatPrice(250000)} = `}
                    <span className="font-bold">
                      ₦${formatPrice(roomCount * 250000)}
                    </span>
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
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
