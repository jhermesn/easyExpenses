"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, Edit, Trash2, ArrowLeft } from "lucide-react"
import { useRouter } from "next/navigation"
import { DatabaseService } from "@/lib/database"
import { CategoryForm } from "@/components/category-form"
import { t, tStatic } from "@/lib/i18n"
import { AppLoader } from "@/components/app-loader"

interface Category {
  id: string
  name: string
  hasRules: boolean
  subcategories: Subcategory[]
  notes?: string
}

interface Subcategory {
  id: string
  name: string
  percentage?: number
  notes?: string
}

export default function CategoriesPage() {
  const isClient = typeof window !== "undefined"
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])
  const [categories, setCategories] = useState<Category[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    try {
      setIsLoading(true)
      const db = DatabaseService.getInstance()
      await db.init()
      const data = await db.getCategories()
      setCategories(data)
    } catch (error) {
      console.error("[ERRO] Erro ao carregar categorias:", error)
      setCategories([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSaveCategory = async (categoryData: any) => {
    try {
      const db = DatabaseService.getInstance()

      if (editingCategory) {
        await db.updateCategory({ ...categoryData, id: editingCategory.id })
      } else {
        await db.addCategory(categoryData)
      }

      await loadCategories()
      setShowForm(false)
      setEditingCategory(null)
    } catch (error) {
      console.error("[ERRO] Erro ao salvar categoria:", error)
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm(t("confirmDeleteCategory"))) {
      try {
        const db = DatabaseService.getInstance()
        await db.deleteCategory(id)
        await loadCategories()
      } catch (error) {
        console.error("[ERRO] Erro ao excluir categoria:", error)
      }
    }
  }

  const handleEditCategory = (category: Category) => {
    setEditingCategory(category)
    setShowForm(true)
  }

  if (!isClient || !mounted) {
    return <AppLoader />
  }

  if (isLoading) {
    return (
        <div className="min-h-screen flex items-center justify-center">
        <div className="text-green-400 text-lg">{tStatic("loading")}</div>
      </div>
    )
  }

  return (
      <div className="min-h-screen text-white p-4">
        <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={() => router.push("/")}
              className="text-green-400 hover:bg-green-600/20 backdrop-blur-sm border border-green-500/20"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                {t("categories")}
              </h1>
              <p className="text-gray-400 mt-1">{t("categoriesPageSubtitle")}</p>
            </div>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            className="bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border border-purple-500/30 shadow-lg px-6 w-full sm:w-auto sm:ml-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            {t("newCategory")}
          </Button>
        </div>

        {/* Category Form */}
        {showForm && (
          <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl p-6">
            <CategoryForm
              category={editingCategory}
              onSave={handleSaveCategory}
              onCancel={() => {
                setShowForm(false)
                setEditingCategory(null)
              }}
            />
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-6">
          {categories.length === 0 ? (
            <Card className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl">
              <CardContent className="text-center py-16">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto">
                    <Plus className="w-8 h-8 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-2">{t("noCategoriesYet")}</h3>
                    <p className="text-gray-400 mb-6">{t("createFirstCategoryPrompt")}</p>
                  </div>
                  <Button
                    onClick={() => setShowForm(true)}
                    className="bg-purple-600/80 hover:bg-purple-600 backdrop-blur-sm border border-purple-500/30 shadow-lg"
                  >
                    {t("createFirstCategory")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            categories.map((category) => (
              <Card
                key={category.id}
                className="bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl hover:border-purple-500/30 transition-all duration-300"
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-white text-xl mb-4">
                        <div className="flex items-center space-x-3">
                          <span>{category.name}</span>
                          {category.hasRules && (
                            <span className="text-xs px-3 py-1 rounded-full bg-purple-600/20 text-purple-400 border border-purple-500/30">
                              {t("withRules")}
                            </span>
                          )}
                        </div>
                      </CardTitle>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditCategory(category)}
                        className="text-blue-400 hover:bg-blue-600/20 backdrop-blur-sm border border-blue-500/20"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-400 hover:bg-red-600/20 backdrop-blur-sm border border-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  {category.notes && (
                    <p className="text-sm text-gray-400 mt-3 bg-black/20 rounded-lg p-3 border border-white/5">
                      {category.notes}
                    </p>
                  )}
                </CardHeader>

                {category.subcategories.length > 0 && (
                  <CardContent>
                    <h4 className="text-sm font-medium text-gray-300 mb-4 flex items-center space-x-2">
                      <span>{t("subcategories")}</span>
                      <span className="text-xs px-2 py-1 rounded-full bg-gray-600/20 text-gray-400">
                        {category.subcategories.length}
                      </span>
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {category.subcategories.map((sub) => (
                        <div
                          key={sub.id}
                          className="bg-black/20 backdrop-blur-sm p-4 rounded-lg border border-white/5 hover:border-white/10 transition-all duration-300"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <span className="text-white font-medium">{sub.name}</span>
                              {sub.notes && <p className="text-xs text-gray-400 mt-2 opacity-80">{sub.notes}</p>}
                            </div>
                            {sub.percentage && (
                              <span className="text-purple-400 font-bold text-lg ml-3">{sub.percentage}%</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                    {category.hasRules && (
                      <div className="mt-4 p-3 bg-purple-900/20 rounded-lg border border-purple-500/20">
                        <div className="text-xs text-purple-300 flex items-center justify-between">
                          <span>{t("totalRules")}</span>
                          <span className="font-bold">
                            {category.subcategories.reduce((sum, sub) => sum + (sub.percentage || 0), 0)}% / 100%
                          </span>
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
        </div>
      </div>
  )
}
