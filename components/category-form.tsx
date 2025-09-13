"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, X } from "lucide-react"
import { generateId, validatePercentages } from "@/lib/utils"
import { t } from "@/lib/i18n"

interface Subcategory {
  id: string
  name: string
  percentage?: number
  notes?: string
}

interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: Subcategory[]
  notes?: string
}

interface CategoryFormProps {
  category?: Category | null
  onSave: (category: any) => void
  onCancel: () => void
}

export function CategoryForm({ category, onSave, onCancel }: CategoryFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    hasRules: false,
    notes: "",
    subcategories: [] as Subcategory[],
  })
  const [errors, setErrors] = useState<string[]>([])

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        hasRules: category.hasRules,
        notes: category.notes || "",
        subcategories: category.subcategories,
      })
    }
  }, [category])

  const addSubcategory = () => {
    setFormData((prev) => ({
      ...prev,
      subcategories: [
        ...prev.subcategories,
        {
          id: generateId(),
          name: "",
          percentage: prev.hasRules ? 0 : undefined,
          notes: "",
        },
      ],
    }))
  }

  const updateSubcategory = (index: number, field: keyof Subcategory, value: any) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.map((sub, i) => (i === index ? { ...sub, [field]: value } : sub)),
    }))
  }

  const removeSubcategory = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      subcategories: prev.subcategories.filter((_, i) => i !== index),
    }))
  }

  const validateForm = () => {
    const newErrors: string[] = []

    if (!formData.name.trim()) {
      newErrors.push(`${t("categoryName")} ${t("required")}`)
    }

    if (formData.subcategories.some((sub) => !sub.name.trim())) {
      newErrors.push(t("allSubcategoriesMustHaveName"))
    }

    if (formData.hasRules && !validatePercentages(formData.subcategories)) {
      newErrors.push(t("percentageExceeded"))
    }

    if (formData.hasRules && formData.subcategories.length === 0) {
      newErrors.push(t("rulesNeedAtLeastOneSubcategory"))
    }

    if (formData.hasRules && formData.subcategories.some((sub) => !sub.percentage || sub.percentage <= 0)) {
      newErrors.push(t("subcategoriesMustHavePercentageGreaterThanZero"))
    }

    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (validateForm()) {
      onSave(formData)
    }
  }

  const toggleRules = (hasRules: boolean) => {
    setFormData((prev) => ({
      ...prev,
      hasRules,
      subcategories: prev.subcategories.map((sub) => ({
        ...sub,
        percentage: hasRules ? sub.percentage || 0 : undefined,
      })),
    }))
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between mb-8">
        <div className="text-center flex-1">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
            {category ? t("editCategory") : t("newCategory")}
          </h2>
          <p className="text-gray-400 mt-2">
            {category ? t("editCategorySubtitle") : t("newCategorySubtitle")}
          </p>
        </div>
        <Button
          type="button"
          onClick={onCancel}
          variant="ghost"
          size="sm"
          className="text-red-400 hover:bg-red-600/20 backdrop-blur-sm border border-red-500/20 p-2 h-8 w-8 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Errors */}
        {errors.length > 0 && (
          <div className="bg-red-900/20 backdrop-blur-sm border border-red-500/30 rounded-lg p-4">
            <h4 className="text-red-400 font-medium mb-2">{t("fixErrors")}</h4>
            <ul className="text-red-300 text-sm space-y-1">
              {errors.map((error, index) => (
                <li key={index} className="flex items-center space-x-2">
                  <span className="w-1 h-1 bg-red-400 rounded-full"></span>
                  <span>{error}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Basic Info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <Label htmlFor="name" className="text-gray-300 text-sm font-medium">
              {t("categoryName")}
            </Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
              className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 transition-all duration-300"
              placeholder={t("categoryNamePlaceholder")}
            />
          </div>

          {/* Notes */}
          <div className="space-y-3">
            <Label htmlFor="notes" className="text-gray-300 text-sm font-medium">
              {t("notes")} <span className="text-gray-500">({t("optional")})</span>
            </Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
              className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50 transition-all duration-300"
              placeholder={t("categoryNotesPlaceholder")}
              rows={3}
            />
          </div>

          {/* Rules Toggle */}
          <div className="bg-black/20 backdrop-blur-sm rounded-lg p-6 border border-white/5">
            <div className="flex items-center space-x-4">
              <Switch
                checked={formData.hasRules}
                onCheckedChange={toggleRules}
                className="data-[state=checked]:bg-purple-600"
              />
              <div className="flex-1">
                <Label className="text-gray-300 font-medium text-base">{t("hasRules")}</Label>
                <p className="text-sm text-gray-400 mt-2">{t("hasRulesHint")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subcategories */}
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <Label className="text-gray-300 text-lg font-medium">{t("subcategories")}</Label>
              <p className="text-sm text-gray-400 mt-1">{t("organizeYourCategoryIntoSubcategories")}</p>
            </div>
            <Button
              type="button"
              onClick={addSubcategory}
              className="bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border border-purple-500/30 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {t("add")}
            </Button>
          </div>

          {formData.subcategories.map((sub, index) => (
            <div
              key={sub.id}
              className="bg-black/20 backdrop-blur-sm p-6 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300"
            >
              <div className="flex justify-between items-start mb-4">
                <h4 className="text-white font-medium">{t("subcategory")} {index + 1}</h4>
                <Button
                  type="button"
                  onClick={() => removeSubcategory(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-400 hover:bg-red-600/20 backdrop-blur-sm border border-red-500/20"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label className="text-gray-300 text-sm">{t("subcategory")}</Label>
                  <Input
                    value={sub.name}
                    onChange={(e) => updateSubcategory(index, "name", e.target.value)}
                    className="bg-black/40 backdrop-blur-sm border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                    placeholder={t("subcategoryNamePlaceholder")}
                  />
                </div>
                {formData.hasRules && (
                  <div className="space-y-2">
                    <Label className="text-gray-300 text-sm">{t("percentage")}</Label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={sub.percentage || 0}
                      onChange={(e) => updateSubcategory(index, "percentage", Number.parseInt(e.target.value) || 0)}
                      className="bg-black/40 backdrop-blur-sm border-white/10 text-white focus:border-purple-500/50"
                      placeholder="50"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-gray-300 text-sm">
                  {t("notes")} <span className="text-gray-500">({t("optional")})</span>
                </Label>
                <Textarea
                  value={sub.notes || ""}
                  onChange={(e) => updateSubcategory(index, "notes", e.target.value)}
                  className="bg-black/40 border-white/10 text-white placeholder:text-gray-500 focus:border-purple-500/50"
                  placeholder={t("subcategoryNotesPlaceholder")}
                  rows={2}
                />
              </div>
            </div>
          ))}

          {formData.hasRules && formData.subcategories.length > 0 && (
            <div className="bg-purple-900/20 backdrop-blur-sm p-4 rounded-lg border border-purple-500/20">
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-300">{t("total")}</span>
                <span className="text-lg font-bold text-purple-400">
                  {formData.subcategories.reduce((sum, sub) => sum + (sub.percentage || 0), 0)}% / 100%
                </span>
              </div>
              {formData.subcategories.reduce((sum, sub) => sum + (sub.percentage || 0), 0) > 100 && (
                <div className="text-red-400 text-sm mt-2 flex items-center space-x-2">
                  <span className="w-2 h-2 bg-red-400 rounded-full"></span>
                  <span>{t("percentageExceeded")}</span>
                </div>
              )}
            </div>
          )}

          {formData.hasRules && formData.subcategories.length === 0 && (
            <div className="text-yellow-400 text-sm bg-yellow-900/20 backdrop-blur-sm p-4 rounded-lg border border-yellow-500/20">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-yellow-400 rounded-full"></span>
                <span>{t("rulesNeedAtLeastOneSubcategory")}</span>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-6">
          <Button
            type="submit"
            className="w-full bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border border-purple-500/30 shadow-lg py-3"
          >
            {t("save")}
          </Button>
        </div>
      </form>
    </div>
  )
}
