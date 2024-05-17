"use client";

import CategorySelector from "@/components/inputs/CategorySelector";
import { Category } from "@prisma/client";
import { Button, Card, Title } from "@tremor/react";
import { useCallback, useState } from "react";

type DefaultCategoriesSelectorProps = {
  categories: Category[];
  currentlySelected: number[];
};

export default function DefaultCategoriesSelector(
  props: DefaultCategoriesSelectorProps,
) {
  const [selectedCategories, setSelectedCategories] = useState<number[]>(
    props.currentlySelected,
  );
  const [saving, setSaving] = useState(false);

  const save = useCallback(async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/save-default-categories", {
        method: "POST",
        body: JSON.stringify({
          categories: selectedCategories,
        }),
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!res.ok) {
        console.error(res);
        alert("Failed to save categories!");
        return;
      }
      alert("Successfully updated default categories!");
    } finally {
      setSaving(false);
    }
  }, [selectedCategories]);
  return (
    <Card className="flex flex-col gap-4">
      <Title>Default Categories</Title>
      <CategorySelector
        disabled={saving}
        categories={props.categories}
        selectedCategories={selectedCategories}
        setSelectedCategories={setSelectedCategories}
      />
      <Button
        onClick={() => {
          save();
        }}
        disabled={saving}
        variant="secondary"
        color="green"
      >
        Save
      </Button>
    </Card>
  );
}
