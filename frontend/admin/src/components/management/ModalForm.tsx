"use client";

import { Modal } from "@/components/ui/modal";
import Form from "@/components/form/Form";
import Label from "@/components/form/Label";
import Input from "@/components/form/input/InputField";
import TextArea from "@/components/form/input/TextArea";
import Select from "@/components/form/Select";
import Button from "@/components/ui/button/Button";
import { FormEvent, ReactNode } from "react";

interface Field {
  name: string;
  label: string;
  type: "text" | "textarea" | "select" | "number";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

interface ModalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  title: string;
  fields: Field[];
  defaultValues?: Record<string, string>;
  children?: ReactNode;
}

export default function ModalForm({
  isOpen,
  onClose,
  onSubmit,
  title,
  fields,
  defaultValues = {},
  children,
}: ModalFormProps) {
  return (
    <Modal isOpen={isOpen} onClose={onClose} className="max-w-xl w-full p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
          {title}
        </h3>
      </div>
      <Form onSubmit={onSubmit}>
        <div className="space-y-4">
          {fields.map((field) => (
            <div key={field.name}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "textarea" ? (
                <TextArea
                  placeholder={field.placeholder}
                  defaultValue={defaultValues[field.name] || ""}
                  rows={4}
                />
              ) : field.type === "select" ? (
                <Select
                  options={field.options || []}
                  placeholder={field.placeholder || `Select ${field.label}`}
                  defaultValue={defaultValues[field.name] || ""}
                  onChange={() => {}}
                />
              ) : (
                <Input
                  type={field.type}
                  id={field.name}
                  name={field.name}
                  placeholder={field.placeholder}
                  defaultValue={defaultValues[field.name] || ""}
                  required={field.required}
                />
              )}
            </div>
          ))}
          {children}
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary">
            Save
          </Button>
        </div>
      </Form>
    </Modal>
  );
}
