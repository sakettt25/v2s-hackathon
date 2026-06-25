"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ISSUE_CATEGORIES } from "@/lib/constants";
import { UploadCloud, Loader2, Sparkles } from "lucide-react";
import type { AICategorization } from "@/lib/types";

export default function IssueForm() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiData, setAiData] = useState<AICategorization | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleAnalyze = async () => {
    if (!description && !file) return;
    
    setIsAnalyzing(true);
    try {
      const formData = new FormData();
      formData.append("description", description);
      if (file) {
        formData.append("file", file);
      }

      const res = await fetch("/api/ai/categorize", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAiData(data);
      }
    } catch (error) {
      console.error("Analysis failed", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // In full implementation:
    // 1. Upload to /api/ai/privacy-filter (server blurs and uploads to Supabase)
    // 2. Insert record to public.issues
    // 3. Call deduplication API
    alert("Form submission logic to be implemented");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Photo / Video</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 flex flex-col items-center justify-center bg-muted/50 transition-colors hover:bg-muted/80">
              {preview ? (
                <div className="relative w-full max-w-sm">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={preview} alt="Preview" className="rounded-md w-full object-cover max-h-[300px]" />
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    className="absolute top-2 right-2"
                    onClick={() => { setFile(null); setPreview(null); setAiData(null); }}
                  >
                    Remove
                  </Button>
                </div>
              ) : (
                <label className="flex flex-col items-center cursor-pointer w-full">
                  <UploadCloud className="h-10 w-10 text-muted-foreground mb-2" />
                  <span className="font-medium text-sm">Click or drag and drop to upload</span>
                  <span className="text-xs text-muted-foreground mt-1">PNG, JPG, up to 10MB</span>
                  <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
                </label>
              )}
            </div>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Faces and license plates will be automatically blurred for privacy.
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Describe the issue in detail..." 
              className="min-h-[100px]"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          {/* AI Analysis trigger */}
          <div className="flex justify-end">
            <Button 
              type="button" 
              variant="secondary" 
              className="gap-2" 
              onClick={handleAnalyze}
              disabled={isAnalyzing || (!description && !file)}
            >
              {isAnalyzing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 text-primary" />}
              Analyze with AI
            </Button>
          </div>

          {/* AI Suggestions (Auto-filled) */}
          {aiData && (
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-2 text-primary font-medium mb-2">
                <Sparkles className="h-4 w-4" />
                AI Categorization
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">Suggested Title</Label>
                  <Input id="title" defaultValue={aiData.suggested_title} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <select 
                    id="category" 
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    defaultValue={aiData.category}
                  >
                    {ISSUE_CATEGORIES.map(c => (
                      <option key={c.value} value={c.value}>{c.icon} {c.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Severity Score: <span className="font-bold text-rose-500">{aiData.severity_score}/10</span></Label>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-rose-500 h-2 rounded-full transition-all" 
                      style={{ width: `${(aiData.severity_score / 10) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Location (Simplified for UI) */}
          <div className="space-y-2">
            <Label>Location</Label>
            <div className="h-[200px] bg-muted rounded-md border flex items-center justify-center">
              <span className="text-muted-foreground text-sm">Map Selector Placeholder</span>
            </div>
          </div>

          <Button type="submit" className="w-full">
            Submit Report
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
