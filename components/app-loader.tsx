"use client"

import { tStatic } from "@/lib/i18n"

export function AppLoader() {
	return (
		<div className="min-h-screen flex items-center justify-center">
			<div className="flex items-center space-x-3">
				<div className="w-8 h-8 border-4 border-green-400 border-t-transparent rounded-full animate-spin"></div>
				<span className="text-green-400 text-lg">{tStatic("loading")}</span>
			</div>
		</div>
	)
}
