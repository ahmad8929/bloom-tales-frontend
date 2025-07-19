
'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Ruler } from "lucide-react";

export function SizeGuide() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="link" className="p-0 h-auto">
            <Ruler className="mr-2 h-4 w-4" />
            Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Clothing Size Guide</DialogTitle>
          <DialogDescription>
            All measurements are in inches. This is a general guide, and sizes may vary between items.
          </DialogDescription>
        </DialogHeader>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Size</TableHead>
              <TableHead>Bust</TableHead>
              <TableHead>Waist</TableHead>
              <TableHead>Hips</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>S</TableCell>
              <TableCell>34-35"</TableCell>
              <TableCell>26-27"</TableCell>
              <TableCell>36-37"</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>M</TableCell>
              <TableCell>36-37"</TableCell>
              <TableCell>28-29"</TableCell>
              <TableCell>38-39"</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>L</TableCell>
              <TableCell>38-40"</TableCell>
              <TableCell>30-32"</TableCell>
              <TableCell>40-42"</TableCell>
            </TableRow>
             <TableRow>
              <TableCell>XL</TableCell>
              <TableCell>41-43"</TableCell>
              <TableCell>33-35"</TableCell>
              <TableCell>43-45"</TableCell>
            </TableRow>
          </TableBody>
        </Table>
        <DialogDescription className="text-xs">
            For kid's and baby sizes, please refer to the age ranges (e.g., 3-6M for 3-6 months, 4-5Y for 4-5 years).
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
}
