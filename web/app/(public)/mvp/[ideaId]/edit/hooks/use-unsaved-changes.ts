import { useCallback, useEffect, useState } from "react";

export function useUnsavedChanges(): [
  boolean,
  React.Dispatch<React.SetStateAction<boolean>>,
  () => void,
] {
  const [isDirty, setIsDirty] = useState(false);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isDirty]);

  const setDirty = useCallback(() => setIsDirty(true), []);

  return [isDirty, setIsDirty, setDirty];
}
