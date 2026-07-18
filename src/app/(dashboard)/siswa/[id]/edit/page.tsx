import { getStudentById } from "@/actions/siswa";
import { notFound } from "next/navigation";
import EditSiswaForm from "./EditSiswaForm";

export default async function EditSiswaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const student = await getStudentById(id);
  if (!student) notFound();

  return <EditSiswaForm student={student} />;
}
