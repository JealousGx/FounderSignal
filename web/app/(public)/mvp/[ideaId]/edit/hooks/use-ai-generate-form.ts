import { useCallback, useEffect, useState } from "react";
import { AIGenerateModalProps } from "../generate-modal";

const MAX_TITLE_LENGTH = 60;
const MAX_DESCRIPTION_LENGTH = 160;
const MAX_INSTRUCTIONS_LENGTH = 500;

interface FormState {
  title: string;
  description: string;
  ctaBtnText: string;
  instructions: string;
}

interface FormErrors {
  title?: string;
  description?: string;
  instructions?: string;
}

type UseAIGenerateFormProps = Pick<
  AIGenerateModalProps,
  | "onGenerate"
  | "initialTitle"
  | "initialDescription"
  | "isEditAIGenerate"
  | "setIsModalOpen"
>;

export const useAIGenerateForm = ({
  onGenerate,
  initialTitle = "",
  initialDescription = "",
  isEditAIGenerate = false,
  setIsModalOpen,
}: UseAIGenerateFormProps) => {
  const [values, setValues] = useState<FormState>({
    title: initialTitle,
    description: initialDescription,
    ctaBtnText: "Get Early Access",
    instructions: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setValues((prev) => ({
      ...prev,
      title: initialTitle,
      description: initialDescription,
    }));

    setErrors({});
  }, [initialTitle, initialDescription]);

  const validate = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    if (isEditAIGenerate) {
      if (values.instructions.length > MAX_INSTRUCTIONS_LENGTH) {
        newErrors.instructions = `Instructions cannot exceed ${MAX_INSTRUCTIONS_LENGTH} characters.`;
      }

      return newErrors;
    }

    if (!values.title) newErrors.title = "Title is required.";
    else if (values.title.length > MAX_TITLE_LENGTH) {
      newErrors.title = `Title cannot exceed ${MAX_TITLE_LENGTH} characters.`;
    }

    if (!values.description) newErrors.description = "Description is required.";
    else if (values.description.length > MAX_DESCRIPTION_LENGTH) {
      newErrors.description = `Description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters.`;
    }

    if (values.instructions.length > MAX_INSTRUCTIONS_LENGTH) {
      newErrors.instructions = `Instructions cannot exceed ${MAX_INSTRUCTIONS_LENGTH} characters.`;
    }

    return newErrors;
  }, [values, isEditAIGenerate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setErrors({});
    setIsGenerating(true);
    await onGenerate(
      values.title,
      values.description,
      values.ctaBtnText,
      values.instructions
    );
    setIsGenerating(false);
    setIsModalOpen(false);
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setValues((prev) => ({ ...prev, [id]: value }));
    if (errors[id as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [id]: undefined }));
    }
  };

  return {
    values,
    errors,
    isGenerating,
    isFormInvalid: Object.values(errors).some(Boolean),
    handleInputChange,
    handleSubmit,
  };
};
