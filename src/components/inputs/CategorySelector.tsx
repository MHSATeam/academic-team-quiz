import { Category } from "@prisma/client";
import { MultiSelect, MultiSelectItem, MultiSelectProps } from "@tremor/react";
import React from "react";

type CategorySelectorProps = Omit<MultiSelectProps, "children"> & {
  categories: Category[];
  selectedCategories: number[];
  setSelectedCategories: React.Dispatch<React.SetStateAction<number[]>>;
};
export default function CategorySelector({
  categories,
  selectedCategories,
  setSelectedCategories,
  ...rest
}: CategorySelectorProps) {
  return (
    <MultiSelect
      {...rest}
      value={selectedCategories.map((id) => id.toString())}
      onValueChange={(values) => {
        setSelectedCategories(
          values
            .map((id) => Number(id))
            .filter((number) => !Number.isNaN(number))
        );
      }}
    >
      {categories.map((category) => (
        <MultiSelectItem key={category.id} value={category.id.toString()}>
          {category.name}
        </MultiSelectItem>
      ))}
    </MultiSelect>
  );
}
