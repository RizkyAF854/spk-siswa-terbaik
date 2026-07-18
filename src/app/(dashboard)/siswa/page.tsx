import { requireAuth } from "@/lib/auth-guard";
import { getAllStudents } from "@/actions/siswa";
import SiswaClient from "./SiswaClient";

export default async function StudentPage() {
  const session = await requireAuth();
  const students = await getAllStudents();

  return <SiswaClient students={students as any} userRole={session.user.role} />;
}
