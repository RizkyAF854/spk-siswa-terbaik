"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, Eye, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";

import { KELAS_OPTIONS, JURUSAN_OPTIONS, TAHUN_AJARAN_OPTIONS } from "@/lib/constants";
import { getGenderLabel } from "@/lib/utils";
import { createStudent, updateStudent, deleteStudent } from "@/actions/siswa";
import type { Student } from "@/types";

interface SiswaClientProps {
  students: Student[];
  userRole: "ADMIN" | "GURU";
}

export default function SiswaClient({ students, userRole }: SiswaClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canManage = userRole === "ADMIN" || userRole === "GURU";

  // Search & Filter State
  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("all");
  const [filterJurusan, setFilterJurusan] = useState("all");



  // Modals / Dialogs State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  // Form Fields
  const [formNis, setFormNis] = useState("");
  const [formNama, setFormNama] = useState("");
  const [formJenisKelamin, setFormJenisKelamin] = useState<"LAKI_LAKI" | "PEREMPUAN">("LAKI_LAKI");
  const [formKelas, setFormKelas] = useState("");
  const [formJurusan, setFormJurusan] = useState("");
  const [formTahunAjaran, setFormTahunAjaran] = useState("2025/2026");

  // Reset form fields
  const resetForm = () => {
    setFormNis("");
    setFormNama("");
    setFormJenisKelamin("LAKI_LAKI");
    setFormKelas("");
    setFormJurusan("");
    setFormTahunAjaran("2025/2026");
  };

  // Filtered & Searched Students
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      const matchesSearch =
        student.nama.toLowerCase().includes(search.toLowerCase()) ||
        student.nis.includes(search);
      const matchesKelas = filterKelas === "all" || student.kelas === filterKelas;
      const matchesJurusan = filterJurusan === "all" || student.jurusan === filterJurusan;

      return matchesSearch && matchesKelas && matchesJurusan;
    });
  }, [students, search, filterKelas, filterJurusan]);



  // Form Submit handler
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNis || !formNama || !formKelas || !formJurusan) {
      toast.error("Semua field wajib diisi!");
      return;
    }

    const formData = new FormData();
    formData.append("nis", formNis);
    formData.append("nama", formNama);
    formData.append("jenisKelamin", formJenisKelamin);
    formData.append("kelas", formKelas);
    formData.append("jurusan", formJurusan);
    formData.append("tahunAjaran", formTahunAjaran);

    if (formMode === "add") {
      startTransition(async () => {
        const res = await createStudent(formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Data siswa berhasil ditambahkan!");
          setIsFormOpen(false);
          resetForm();
          router.refresh();
        }
      });
    } else if (formMode === "edit" && selectedStudent) {
      startTransition(async () => {
        const res = await updateStudent(selectedStudent.id, formData);
        if (res.error) {
          toast.error(res.error);
        } else {
          toast.success("Data siswa berhasil diperbarui!");
          setIsFormOpen(false);
          resetForm();
          router.refresh();
        }
      });
    }
  };

  const handleAddClick = () => {
    setFormMode("add");
    resetForm();
    setIsFormOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setFormMode("edit");
    setSelectedStudent(student);
    setFormNis(student.nis);
    setFormNama(student.nama);
    setFormJenisKelamin(student.jenisKelamin);
    setFormKelas(student.kelas);
    setFormJurusan(student.jurusan);
    setFormTahunAjaran(student.tahunAjaran);
    setIsFormOpen(true);
  };

  const handleDetailClick = (student: Student) => {
    setSelectedStudent(student);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (student: Student) => {
    setSelectedStudent(student);
    setIsConfirmOpen(true);
  };

  const handleConfirmDelete = () => {
    if (selectedStudent) {
      startTransition(async () => {
        const res = await deleteStudent(selectedStudent.id);
        if (res.success) {
          toast.success("Data siswa berhasil dihapus!");
          setIsConfirmOpen(false);
          router.refresh();
        } else {
          toast.error("Gagal menghapus data siswa.");
        }
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Daftar Siswa
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Kelola data siswa terdaftar di SMK Karya Guna Bhakti 2 Kota Bekasi
          </p>
        </div>
        {canManage && (
          <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-medium shrink-0">
            <Plus className="h-4 w-4" />
            Tambah Siswa
          </Button>
        )}
      </div>

      {/* Filter Toolbar */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Cari NIS atau nama siswa..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                }}
                className="pl-9 text-sm"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-zinc-500" />
                <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                  Filter:
                </span>
              </div>

              {/* Kelas Filter */}
              <Select
                value={filterKelas}
                onValueChange={(val) => {
                  if (val) {
                    setFilterKelas(val);
                  }
                }}
              >
                <SelectTrigger className="w-[150px] text-sm">
                  <SelectValue placeholder="Semua Kelas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Kelas</SelectItem>
                  {KELAS_OPTIONS.map((k) => (
                    <SelectItem key={k} value={k}>
                      {k}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Jurusan Filter */}
              <Select
                value={filterJurusan}
                onValueChange={(val) => {
                  if (val) {
                    setFilterJurusan(val);
                  }
                }}
              >
                <SelectTrigger className="w-[180px] text-sm">
                  <SelectValue placeholder="Semua Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua Jurusan</SelectItem>
                  {JURUSAN_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear Filters */}
              {(filterKelas !== "all" || filterJurusan !== "all" || search) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setFilterKelas("all");
                    setFilterJurusan("all");
                  }}
                  className="text-xs text-rose-500 hover:text-rose-700 h-8 px-2"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Student List Table */}
      <Card>
        <CardContent className="p-0">
          {filteredStudents.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Siswa Tidak Ditemukan"
                description="Cobalah ubah filter pencarian Anda atau buat data siswa baru."
                actionLabel={canManage ? "Tambah Siswa Baru" : undefined}
                onAction={canManage ? handleAddClick : undefined}
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-zinc-50/50 dark:bg-zinc-900/10">
                    <TableHead className="w-[50px] text-center font-semibold">No</TableHead>
                    <TableHead className="w-[120px] font-semibold">NIS</TableHead>
                    <TableHead className="font-semibold">Nama Siswa</TableHead>
                    <TableHead className="font-semibold">L/P</TableHead>
                    <TableHead className="font-semibold">Kelas</TableHead>
                    <TableHead className="font-semibold">Jurusan</TableHead>
                    <TableHead className="font-semibold">T.A.</TableHead>
                    <TableHead className="text-right font-semibold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student, index) => (
                    <TableRow key={student.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                      <TableCell className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {student.nis}
                      </TableCell>
                      <TableCell className="font-medium">{student.nama}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            student.jenisKelamin === "LAKI_LAKI"
                              ? "border-blue-200 bg-blue-50/50 text-blue-700 dark:border-blue-900/30 dark:bg-blue-950/20"
                              : "border-pink-200 bg-pink-50/50 text-pink-700 dark:border-pink-900/30 dark:bg-pink-950/20"
                          }
                        >
                          {student.jenisKelamin === "LAKI_LAKI" ? "L" : "P"}
                        </Badge>
                      </TableCell>
                      <TableCell>{student.kelas}</TableCell>
                      <TableCell className="max-w-[200px] truncate">{student.jurusan}</TableCell>
                      <TableCell>{student.tahunAjaran}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDetailClick(student)}
                            className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canManage && (
                            <>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleEditClick(student)}
                                className="text-blue-500 hover:text-blue-700"
                              >
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => handleDeleteClick(student)}
                                className="text-rose-500 hover:text-rose-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Total Data Info */}
      {filteredStudents.length > 0 && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Menampilkan <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredStudents.length}</span> data siswa
        </div>
      )}

      {/* Form Dialog for Add/Edit */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{formMode === "add" ? "Tambah Siswa Baru" : "Edit Data Siswa"}</DialogTitle>
            <DialogDescription>
              Isi data detail siswa di bawah ini secara lengkap.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nis">NIS</Label>
                <Input
                  id="nis"
                  placeholder="2025xxxx"
                  value={formNis}
                  onChange={(e) => {
                    const value = e.target.value.replace(/[^0-9]/g, "");
                    setFormNis(value);
                  }}
                  inputMode="numeric"
                  disabled={formMode === "edit"}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="jenisKelamin">Jenis Kelamin</Label>
                <Select
                  value={formJenisKelamin}
                  onValueChange={(val) => {
                    if (val === "LAKI_LAKI" || val === "PEREMPUAN") {
                      setFormJenisKelamin(val);
                    }
                  }}
                >
                  <SelectTrigger id="jenisKelamin">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LAKI_LAKI">Laki-laki</SelectItem>
                    <SelectItem value="PEREMPUAN">Perempuan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="nama">Nama Lengkap</Label>
              <Input
                id="nama"
                placeholder="Ahmad Fauzi"
                value={formNama}
                onChange={(e) => {
                  const value = e.target.value.replace(/[0-9]/g, "");
                  setFormNama(value);
                }}
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kelas">Kelas</Label>
                <Select
                  value={formKelas}
                  onValueChange={(val) => {
                    if (val) setFormKelas(val);
                  }}
                >
                  <SelectTrigger id="kelas">
                    <SelectValue placeholder="Pilih Kelas" />
                  </SelectTrigger>
                  <SelectContent>
                    {KELAS_OPTIONS.map((k) => (
                      <SelectItem key={k} value={k}>
                        {k}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahunAjaran">Tahun Ajaran</Label>
                <Select
                  value={formTahunAjaran}
                  onValueChange={(val) => {
                    if (val) setFormTahunAjaran(val);
                  }}
                >
                  <SelectTrigger id="tahunAjaran">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TAHUN_AJARAN_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="jurusan">Jurusan</Label>
              <Select
                value={formJurusan}
                onValueChange={(val) => {
                  if (val) setFormJurusan(val);
                }}
              >
                <SelectTrigger id="jurusan">
                  <SelectValue placeholder="Pilih Jurusan" />
                </SelectTrigger>
                <SelectContent>
                  {JURUSAN_OPTIONS.map((j) => (
                    <SelectItem key={j} value={j}>
                      {j}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} size="sm">
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white" size="sm" disabled={isPending}>
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Detail Profil Siswa</DialogTitle>
            <DialogDescription>
              Detail informasi data siswa terdaftar.
            </DialogDescription>
          </DialogHeader>
          {selectedStudent && (
            <div className="space-y-4 pt-4">
              <div className="flex items-center gap-4 pb-4 border-b border-zinc-150 dark:border-zinc-800">
                <div className="h-12 w-12 rounded-full bg-blue-100 dark:bg-blue-950/40 text-blue-700 flex items-center justify-center font-bold text-lg border border-blue-200 dark:border-blue-900/30">
                  {selectedStudent.nama.charAt(0)}
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-50">{selectedStudent.nama}</h3>
                  <p className="text-xs text-zinc-500">NIS: {selectedStudent.nis}</p>
                </div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Jenis Kelamin:</span>
                  <span className="font-semibold">{getGenderLabel(selectedStudent.jenisKelamin)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Kelas:</span>
                  <span className="font-semibold">{selectedStudent.kelas}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Jurusan:</span>
                  <span className="font-semibold">{selectedStudent.jurusan}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-500 font-medium">Tahun Ajaran:</span>
                  <span className="font-semibold">{selectedStudent.tahunAjaran}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="pt-4">
            <Button onClick={() => setIsDetailOpen(false)} size="sm">Tutup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation box */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Hapus Data Siswa?"
        description={`Apakah Anda yakin ingin menghapus data siswa ${selectedStudent?.nama}? Tindakan ini permanen dan tidak dapat dibatalkan.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
