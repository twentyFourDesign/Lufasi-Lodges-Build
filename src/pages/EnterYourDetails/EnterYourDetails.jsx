/* eslint-disable no-unused-vars */
import React from "react";
import { useForm } from "react-hook-form";
import CommonNavbar from "@/components/shared/common/CommonNavbar/CommonNavbar";

import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";

import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  ArrowLeft,
  Calendar as CalendarIcon,
  Home,
  Wallet,
  Users,
  FileUp,
} from "lucide-react";

import { Link } from "react-router-dom";

export default function EnterDetails() {
  const form = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      gender: "",
      dob: "",
      instruction: "",
      guest1: "",
      guest2: "",
    },
  });

  return (
    <div className="overflow-x-hidden min-h-screen w-full bg-[#F7F5F0]">
      <CommonNavbar />
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8 py-10">
        <Button
          variant="ghost"
          className="flex items-center gap-2 text-sm text-gray-700 mb-6 pl-0 hover:bg-transparent"
        >
          <ArrowLeft className="w-4 h-4" />
          <Link to="/extras">Back</Link>
        </Button>

        <h2 className="text-2xl md:text-5xl font-bold text-[#09432B] text-center">
          Enter Your Details
        </h2>
        <p className="text-center text-sm md:text-lg font-medium text-[#737373] mt-2 mb-10">
          Step 5 of 6 – Add your & guest details
        </p>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-8">
            <Form {...form}>
              <form className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 ">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input
                            className="border-[#29A3A3] border"
                            placeholder="Enter First Name"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input
                            className="border-[#29A3A3] border"
                            placeholder="Enter Last Name"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input
                            className="border-[#29A3A3] border"
                            placeholder="Enter Email"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <Input
                            className="border-[#29A3A3] border"
                            placeholder="Enter Phone Number"
                            {...field}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="gender"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gender</FormLabel>
                        <Select onValueChange={field.onChange}>
                          <FormControl>
                            <SelectTrigger className="border-[#29A3A3] border">
                              <SelectValue placeholder="Select Gender" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="dob"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl className="border-[#29A3A3] border">
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-full justify-between text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value
                                  ? format(field.value, "MM/dd/yyyy")
                                  : "Enter Date of Birth"}
                                <CalendarIcon className="h-4 w-4 opacity-60" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>

                          <PopoverContent className="p-0">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="instruction"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instruction</FormLabel>
                      <FormControl>
                        <Input
                          className="border-[#29A3A3] border"
                          placeholder="State any dietary or setup requirements like a bath or a children's cot"
                          {...field}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <div>
                  <FormLabel>
                    Upload Identification (Passport, National ID, Drivers
                    License)
                  </FormLabel>

                  <div className="mt-2 border border-[#29A3A3] rounded-md w-full h-14 flex flex-col items-center justify-center text-sm text-gray-500 cursor-pointer">
                    <FileUp className="w-4 h-4 mb-1" />
                    Upload File
                  </div>
                </div>
                <Accordion type="single" collapsible defaultValue="guests">
                  <AccordionItem
                    value="guests"
                    className="border-none rounded-lg overflow-hidden mt-6"
                  >
                    <AccordionTrigger className="bg-[#C8FBFF] px-4 py-3 text-[#09432B] text-base md:text-2xl font-bold">
                      Enter Guests Information
                    </AccordionTrigger>
                    <AccordionContent className="bg-[#C8FBFF] px-4 py-4 space-y-4">
                      <FormField
                        control={form.control}
                        name="guest1"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest 1</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Guest Name"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="guest2"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Guest 2</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter Guest Name"
                                {...field}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </form>
            </Form>
          </div>
          <div className="md:col-span-4 space-y-4">
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#09432B]" />
                  <h4 className="text-[#09432B] font-bold text-base">
                    Stay Dates
                  </h4>
                </div>
                <p className="text-sm font-semibold text-[#09432B]">2 Nights</p>
              </div>

              <div className="flex items-start justify-between w-full text-sm">
                <div>
                  <p className="text-[#737373]">Check in:</p>
                  <p className="text-[#4F4F4F] font-medium mt-1">01/02/2025</p>
                </div>

                <div>
                  <p className="text-[#737373]">Check out:</p>
                  <p className="text-[#4F4F4F] font-medium mt-1">04/02/2025</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Home className="w-5 h-5 text-[#09432B]" />
                <h4 className="text-[#09432B] font-bold">Your Pod</h4>
              </div>
              <p className="text-sm text-[#737373]">Forest Haven</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-[#09432B]" />
                <h4 className="text-[#09432B] font-bold">Meal Plan</h4>
              </div>
              <p className="text-sm text-[#737373]">N/A</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-[#09432B]" />
                <h4 className="text-[#09432B] font-bold">Guests</h4>
              </div>
              <p className="text-sm text-[#737373]">2 Adults (18+)</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="flex items-center gap-2 mb-3">
                <Wallet className="w-5 h-5 text-[#09432B]" />
                <h4 className="text-[#09432B] font-bold">Extras</h4>
              </div>
              <p className="text-sm text-[#737373]">N/A</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-sm">
              <h4 className="text-[#09432B] font-bold mb-3">Price Summary</h4>

              <div className="space-y-3 text-sm text-[#09432B]">
                <div className="flex justify-between">
                  <span>Sub Total:</span>
                  <span>₦0</span>
                </div>

                <div className="flex justify-between leading-snug">
                  <span>
                    After consumption tax and <br /> VAT(12.5%)
                  </span>
                  <span>₦0</span>
                </div>

                <div className="flex justify-between">
                  <span>Discount</span>
                  <span>0%</span>
                </div>

                <div className="border-t pt-3 flex justify-between bg-[#F2EFE7] px-3 py-2 rounded-md">
                  <span>Total:</span>
                  <span>₦0</span>
                </div>
              </div>
            </div>
            <div className="w-full rounded-t-xl overflow-hidden">
              <div
                className="px-4 py-3 text-[#0A4C30] text-sm font-medium"
                style={{ backgroundColor: "#B7FFFF" }}
              >
                All done entering your details? Let’s move ahead
              </div>

              <Button
                asChild
                className="w-full bg-[#09432B] hover:bg-[#083f28] text-white text-base font-bold py-6 rounded-none rounded-b-xl"
              >
                <Link
                  to="/review-your-booking"
                  className="flex items-center justify-center gap-2"
                >
                  Review Your Booking →
                </Link>
              </Button>
            </div>

            {/* Skip Button */}
            <Button
              variant="outline"
              className="w-full py-6 rounded-md border border-[#A19257] bg-white text-[#09432B] font-medium"
            >
              Skip Extras
            </Button>

            {/* Quick Book */}
            <Button className="w-full py-6 rounded-md hover:bg-[#A19257] bg-[#A19257] text-white font-semibold">
              Quick Book
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
