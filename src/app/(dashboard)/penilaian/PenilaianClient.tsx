"use client";

import { useState, useMemo, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Edit2, Trash2, SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
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

import { KELAS_OPTIONS, TAHUN_AJARAN_OPTIONS, CRITERIA_SCORE_KEYS, TAHUN_AJARAN_AKTIF } from "@/lib/constants";
import { saveAssessments, deleteAssessment } from "@/actions/penilaian";
import type { StudentAssessment, Student, Criteria } from "@/types";

interface PenilaianClientProps {
  assessments: StudentAssessment[];
  allStudents: Student[];
  criteria: Criteria[];
  userRole: "ADMIN" | "GURU";
}

export default function PenilaianClient({
  assessments,
  allStudents,
  criteria,
  userRole,
}: PenilaianClientProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [search, setSearch] = useState("");
  const [filterKelas, setFilterKelas] = useState("all");
  const [filterTahunAjaran, setFilterTahunAjaran] = useState(TAHUN_AJARAN_AKTIF);



  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState<StudentAssessment | null>(null);
  const [formMode, setFormMode] = useState<"add" | "edit">("add");

  // Form Fields — dynamic scores keyed by criteria field name
  const [studentId, setStudentId] = useState("");
  const [formScores, setFormScores] = useState<Record<string, number>>({});

  // Available students who do NOT have an assessment yet (for ADD mode)
  const unassessedStudents = useMemo(() => {
    const assessedIds = new Set(assessments.map((a) => a.student.id));
    return allStudents.filter((s) => !assessedIds.has(s.id));
  }, [assessments, allStudents]);

  const resetForm = () => {
    setStudentId("");
    // Initialize all criteria score fields to 0
    const defaultScores: Record<string, number> = {};
    criteria.forEach((c) => {
      const key = CRITERIA_SCORE_KEYS[c.kode] ?? c.kode.toLowerCase();
      defaultScores[key] = 0;
    });
    setFormScores(defaultScores);
  };

  const handleAddClick = () => {
    if (unassessedStudents.length === 0) {
      toast.warning("Semua siswa terdaftar sudah memiliki penilaian!");
      return;
    }
    setFormMode("add");
    resetForm();
    // Default to first available student
    setStudentId(unassessedStudents[0].id);
    setIsFormOpen(true);
  };

  const handleEditClick = (a: StudentAssessment) => {
    setFormMode("edit");
    setSelectedAssessment(a);
    setStudentId(a.student.id);
    setFormScores({ ...a.scores });
    setIsFormOpen(true);
  };

  const handleDeleteClick = (a: StudentAssessment) => {
    setSelectedAssessment(a);
    setIsConfirmOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate score ranges
    const scoreValues = Object.values(formScores);
    if (scoreValues.some((score) => score < 0 || score > 100)) {
      toast.error("Nilai kriteria harus berada dalam rentang 0 - 100!");
      return;
    }

    // Build the values array for the server action
    const values = criteria.map((c) => {
      const key = CRITERIA_SCORE_KEYS[c.kode] ?? c.kode.toLowerCase();
      return {
        criteriaId: c.id,
        nilai: formScores[key] ?? 0,
      };
    });

    const targetStudentId = formMode === "add" ? studentId : selectedAssessment?.student.id;
    if (!targetStudentId) return;

    const studentName = formMode === "add"
      ? allStudents.find((s) => s.id === targetStudentId)?.nama ?? ""
      : selectedAssessment?.student.nama ?? "";

    startTransition(async () => {
      const res = await saveAssessments(targetStudentId, values);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success(
          formMode === "add"
            ? `Berhasil menyimpan nilai untuk siswa ${studentName}!`
            : `Berhasil memperbarui nilai siswa ${studentName}!`
        );
        setIsFormOpen(false);
        resetForm();
        router.refresh();
      }
    });
  };

  const handleConfirmDelete = () => {
    if (selectedAssessment) {
      startTransition(async () => {
        const res = await deleteAssessment(selectedAssessment.student.id);
        if (res.success) {
          toast.success("Penilaian berhasil dihapus!");
          setIsConfirmOpen(false);
          router.refresh();
        } else {
          toast.error("Gagal menghapus penilaian.");
        }
      });
    }
  };

  // Helper: update a single score field
  const updateScore = (key: string, value: number) => {
    setFormScores((prev) => ({ ...prev, [key]: value }));
  };

  // Build criteria display config from context criteria
  const criteriaDisplayConfig = useMemo(() => {
    const colorMap: Record<string, { headerBg: string; cellText: string; cellBg: string; labelColor: string }> = {
      C1: {
        headerBg: "bg-blue-50/20 dark:bg-blue-900/5",
        cellText: "text-blue-700 dark:text-blue-400",
        cellBg: "bg-blue-50/10 dark:bg-blue-950/5",
        labelColor: "text-blue-700 dark:text-blue-400",
      },
      C2: {
        headerBg: "bg-emerald-50/20 dark:bg-emerald-900/5",
        cellText: "text-emerald-700 dark:text-emerald-400",
        cellBg: "bg-emerald-50/10 dark:bg-emerald-950/5",
        labelColor: "text-emerald-700 dark:text-emerald-400",
      },
      C3: {
        headerBg: "bg-amber-50/20 dark:bg-amber-900/5",
        cellText: "text-amber-700 dark:text-amber-400",
        cellBg: "bg-amber-50/10 dark:bg-amber-950/5",
        labelColor: "text-amber-700 dark:text-amber-400",
      },
      C4: {
        headerBg: "bg-purple-50/20 dark:bg-purple-900/5",
        cellText: "text-purple-700 dark:text-purple-400",
        cellBg: "bg-purple-50/10 dark:bg-purple-950/5",
        labelColor: "text-purple-700 dark:text-purple-400",
      },
    };
    const fallback = {
      headerBg: "bg-zinc-50/20 dark:bg-zinc-900/5",
      cellText: "text-zinc-700 dark:text-zinc-400",
      cellBg: "bg-zinc-50/10 dark:bg-zinc-950/5",
      labelColor: "text-zinc-700 dark:text-zinc-400",
    };

    return criteria.map((c) => ({
      criteria: c,
      scoreKey: CRITERIA_SCORE_KEYS[c.kode] ?? c.kode.toLowerCase(),
      colors: colorMap[c.kode] ?? fallback,
    }));
  }, [criteria]);

  // Filtered Assessments
  const filteredAssessments = useMemo(() => {
    return assessments.filter((a) => {
      const matchesSearch = a.student.nama.toLowerCase().includes(search.toLowerCase()) ||
        a.student.nis.includes(search);
      const matchesKelas = filterKelas === "all" || a.student.kelas === filterKelas;
      const matchesTahun = filterTahunAjaran === "all" || a.student.tahunAjaran === filterTahunAjaran;

      return matchesSearch && matchesKelas && matchesTahun;
    });
  }, [assessments, search, filterKelas, filterTahunAjaran]);



  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            Penilaian Siswa
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Input dan kelola skor penilaian siswa untuk setiap kriteria
          </p>
        </div>
        <Button onClick={handleAddClick} className="bg-blue-600 hover:bg-blue-500 text-white gap-2 font-medium shrink-0" disabled={isPending}>
          <Plus className="h-4 w-4" />
          Input Nilai Baru
        </Button>
      </div>

      {/* Filter Card */}
      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Search */}
            <div className="relative w-full lg:max-w-xs">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input
                type="text"
                placeholder="Cari siswa..."
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

              {/* Kelas */}
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

              {/* Tahun Ajaran */}
              <Select
                value={filterTahunAjaran}
                onValueChange={(val) => {
                  if (val) {
                    setFilterTahunAjaran(val);
                  }
                }}
              >
                <SelectTrigger className="w-[160px] text-sm">
                  <SelectValue placeholder="Pilih Tahun Ajaran" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Semua T.A.</SelectItem>
                  {TAHUN_AJARAN_OPTIONS.map((t) => (
                    <SelectItem key={t} value={t}>
                      T.A. {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Clear */}
              {(filterKelas !== "all" || filterTahunAjaran !== TAHUN_AJARAN_AKTIF || search) && (
                <Button
                  variant="ghost"
                  onClick={() => {
                    setSearch("");
                    setFilterKelas("all");
                    setFilterTahunAjaran(TAHUN_AJARAN_AKTIF);
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

      {/* Assessment Table */}
      <Card>
        <CardContent className="p-0">
          {filteredAssessments.length === 0 ? (
            <div className="p-8">
              <EmptyState
                title="Penilaian Belum Diinput"
                description="Belum ada data penilaian siswa untuk filter kelas ini."
                actionLabel="Input Nilai Baru"
                onAction={handleAddClick}
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
                    <TableHead className="font-semibold">Kelas</TableHead>
                    {criteriaDisplayConfig.map((cfg) => (
                      <TableHead
                        key={cfg.criteria.id}
                        className={`text-center font-semibold ${cfg.colors.headerBg}`}
                      >
                        {cfg.criteria.nama} ({cfg.criteria.kode})
                      </TableHead>
                    ))}
                    <TableHead className="text-right font-semibold">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAssessments.map((a, index) => (
                    <TableRow key={a.id} className="hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10">
                      <TableCell className="text-center text-sm text-zinc-500 dark:text-zinc-400">
                        {index + 1}
                      </TableCell>
                      <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {a.student.nis}
                      </TableCell>
                      <TableCell className="font-semibold">{a.student.nama}</TableCell>
                      <TableCell className="text-xs text-zinc-500 font-semibold">{a.student.kelas}</TableCell>
                      {criteriaDisplayConfig.map((cfg) => (
                        <TableCell
                          key={cfg.criteria.id}
                          className={`text-center font-bold font-mono ${cfg.colors.cellText} ${cfg.colors.cellBg}`}
                        >
                          {a.scores[cfg.scoreKey] ?? 0}
                        </TableCell>
                      ))}
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleEditClick(a)}
                            className="text-blue-500 hover:text-blue-700"
                            disabled={isPending}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            onClick={() => handleDeleteClick(a)}
                            className="text-rose-500 hover:text-rose-700"
                            disabled={isPending}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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
      {filteredAssessments.length > 0 && (
        <div className="text-sm text-zinc-500 dark:text-zinc-400">
          Menampilkan <span className="font-semibold text-zinc-700 dark:text-zinc-300">{filteredAssessments.length}</span> data penilaian
        </div>
      )}

      {/* Form Add/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {formMode === "add" ? "Input Penilaian Baru" : "Edit Penilaian Siswa"}
            </DialogTitle>
            <DialogDescription>
              Masukkan nilai kriteria dalam rentang <strong>0 hingga 100</strong>.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            {/* Student selection field */}
            <div className="space-y-2">
              <Label>Nama Siswa</Label>
              {formMode === "add" ? (
                <Select
                  value={studentId}
                  onValueChange={(val) => {
                    if (val) setStudentId(val);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Siswa" />
                  </SelectTrigger>
                  <SelectContent>
                    {unassessedStudents.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.nama} ({s.kelas})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-3 bg-zinc-100 rounded-lg font-semibold text-sm text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300">
                  {selectedAssessment?.student.nama} ({selectedAssessment?.student.kelas})
                </div>
              )}
            </div>

            {/* Dynamic Score Grid Inputs */}
            <div className="grid grid-cols-2 gap-4">
              {criteriaDisplayConfig.map((cfg) => (
                <div key={cfg.criteria.id} className="space-y-2">
                  <Label
                    htmlFor={`score-${cfg.scoreKey}`}
                    className={`${cfg.colors.labelColor} font-semibold`}
                  >
                    {cfg.criteria.kode}: {cfg.criteria.nama}
                  </Label>
                  <Input
                    id={`score-${cfg.scoreKey}`}
                    type="number"
                    min="0"
                    max="100"
                    placeholder="85"
                    value={formScores[cfg.scoreKey] || ""}
                    onChange={(e) => updateScore(cfg.scoreKey, Number(e.target.value))}
                    required
                  />
                </div>
              ))}
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)} size="sm">
                Batal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white" size="sm" disabled={isPending}>
                Simpan Penilaian
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Confirmation delete */}
      <ConfirmDialog
        open={isConfirmOpen}
        onOpenChange={setIsConfirmOpen}
        title="Hapus Penilaian?"
        description={`Apakah Anda yakin ingin menghapus data penilaian untuk ${selectedAssessment?.student.nama}? Tindakan ini dapat mengubah hasil perhitungan ranking.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
