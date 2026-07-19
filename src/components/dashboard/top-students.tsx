"use client";

import { Award, ArrowRight } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatNumber, getStatusColor } from "@/lib/utils";
import type { RankingWithStudent } from "@/types";
import Link from "next/link";

interface TopStudentsProps {
  rankings: RankingWithStudent[];
}

export function TopStudents({ rankings }: TopStudentsProps) {
  // Take top 5
  const topFive = rankings.slice(0, 5);

  return (
    <Card className="col-span-full">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="p-2 bg-amber-50 rounded-lg dark:bg-amber-950/20 text-amber-600 border border-amber-100 dark:border-amber-900/30">
            <Award className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>Top 5 Siswa Terbaik</CardTitle>
            <CardDescription>Hasil Perhitungan Terakhir</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="px-0 sm:px-0">
        {topFive.length === 0 ? (
          <div className="text-center py-8 text-sm text-zinc-500">
            Belum ada data hasil perhitungan ranking.
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="data-table">
                <thead>
                  <tr>
                    <th className="w-16 text-center">No</th>
                    <th>Nama Siswa</th>
                    <th>Kelas</th>
                    <th className="text-center">Nilai V</th>
                    <th className="text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody>
                  {topFive.map((rank) => (
                    <tr key={rank.id}>
                      <td className="text-center font-bold">{rank.ranking}</td>
                      <td className="font-semibold">{rank.student?.nama}</td>
                      <td className="text-zinc-500 dark:text-zinc-400">{rank.student?.kelas}</td>
                      <td className="text-center font-mono font-semibold">{formatNumber(rank.nilaiV)}</td>
                      <td className="text-center">
                        <span className={`badge ${getStatusColor(rank.status)}`}>
                          {rank.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="px-6 pt-4 flex justify-center">
              <Link
                href="/ranking"
                className="btn btn-secondary text-sm group"
              >
                Lihat Hasil Perankingan Lengkap
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
