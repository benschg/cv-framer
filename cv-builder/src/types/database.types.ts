export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.5';
  };
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          extensions?: Json;
          operationName?: string;
          query?: string;
          variables?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      certification_documents: {
        Row: {
          certification_id: string;
          display_order: number | null;
          document_name: string;
          document_url: string;
          file_size: number | null;
          file_type: string | null;
          id: string;
          storage_path: string;
          uploaded_at: string | null;
          user_id: string;
        };
        Insert: {
          certification_id: string;
          display_order?: number | null;
          document_name: string;
          document_url: string;
          file_size?: number | null;
          file_type?: string | null;
          id?: string;
          storage_path: string;
          uploaded_at?: string | null;
          user_id: string;
        };
        Update: {
          certification_id?: string;
          display_order?: number | null;
          document_name?: string;
          document_url?: string;
          file_size?: number | null;
          file_type?: string | null;
          id?: string;
          storage_path?: string;
          uploaded_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'certification_documents_certification_id_fkey';
            columns: ['certification_id'];
            isOneToOne: false;
            referencedRelation: 'profile_certifications';
            referencedColumns: ['id'];
          },
        ];
      };
      cover_letters: {
        Row: {
          ai_metadata: Json | null;
          content: Json | null;
          created_at: string | null;
          cv_id: string | null;
          id: string;
          is_archived: boolean | null;
          job_context: Json | null;
          language: string | null;
          name: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          ai_metadata?: Json | null;
          content?: Json | null;
          created_at?: string | null;
          cv_id?: string | null;
          id?: string;
          is_archived?: boolean | null;
          job_context?: Json | null;
          language?: string | null;
          name: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          ai_metadata?: Json | null;
          content?: Json | null;
          created_at?: string | null;
          cv_id?: string | null;
          id?: string;
          is_archived?: boolean | null;
          job_context?: Json | null;
          language?: string | null;
          name?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cover_letters_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_documents: {
        Row: {
          ai_metadata: Json | null;
          content: Json;
          created_at: string | null;
          description: string | null;
          display_settings: Json | null;
          id: string;
          is_archived: boolean | null;
          is_default: boolean | null;
          job_context: Json | null;
          language: string | null;
          name: string;
          selected_photo_id: string | null;
          template_id: string | null;
          updated_at: string | null;
          user_id: string;
          werbeflaechen_snapshot: Json | null;
        };
        Insert: {
          ai_metadata?: Json | null;
          content?: Json;
          created_at?: string | null;
          description?: string | null;
          display_settings?: Json | null;
          id?: string;
          is_archived?: boolean | null;
          is_default?: boolean | null;
          job_context?: Json | null;
          language?: string | null;
          name: string;
          selected_photo_id?: string | null;
          template_id?: string | null;
          updated_at?: string | null;
          user_id: string;
          werbeflaechen_snapshot?: Json | null;
        };
        Update: {
          ai_metadata?: Json | null;
          content?: Json;
          created_at?: string | null;
          description?: string | null;
          display_settings?: Json | null;
          id?: string;
          is_archived?: boolean | null;
          is_default?: boolean | null;
          job_context?: Json | null;
          language?: string | null;
          name?: string;
          selected_photo_id?: string | null;
          template_id?: string | null;
          updated_at?: string | null;
          user_id?: string;
          werbeflaechen_snapshot?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_documents_selected_photo_id_fkey';
            columns: ['selected_photo_id'];
            isOneToOne: false;
            referencedRelation: 'profile_photos';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_documents_template_id_fkey';
            columns: ['template_id'];
            isOneToOne: false;
            referencedRelation: 'cv_templates';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_education_selections: {
        Row: {
          created_at: string | null;
          cv_id: string;
          description_override: string | null;
          display_order: number | null;
          education_id: string;
          id: string;
          is_favorite: boolean | null;
          is_selected: boolean | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          description_override?: string | null;
          display_order?: number | null;
          education_id: string;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          description_override?: string | null;
          display_order?: number | null;
          education_id?: string;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_education_selections_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_education_selections_education_id_fkey';
            columns: ['education_id'];
            isOneToOne: false;
            referencedRelation: 'profile_educations';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_key_competence_selections: {
        Row: {
          created_at: string | null;
          cv_id: string;
          description_override: string | null;
          display_order: number | null;
          id: string;
          is_favorite: boolean | null;
          is_selected: boolean | null;
          key_competence_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          key_competence_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          key_competence_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_key_competence_selections_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_key_competence_selections_key_competence_id_fkey';
            columns: ['key_competence_id'];
            isOneToOne: false;
            referencedRelation: 'profile_key_competences';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_project_selections: {
        Row: {
          created_at: string | null;
          cv_id: string;
          description_override: string | null;
          display_order: number | null;
          id: string;
          is_favorite: boolean | null;
          is_selected: boolean | null;
          profile_project_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          profile_project_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          profile_project_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_project_selections_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_project_selections_profile_project_id_fkey';
            columns: ['profile_project_id'];
            isOneToOne: false;
            referencedRelation: 'profile_projects';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_skill_category_selections: {
        Row: {
          created_at: string | null;
          cv_id: string;
          display_order: number | null;
          id: string;
          is_favorite: boolean | null;
          is_selected: boolean | null;
          selected_skill_indices: number[] | null;
          skill_category_id: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          selected_skill_indices?: number[] | null;
          skill_category_id: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          selected_skill_indices?: number[] | null;
          skill_category_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_skill_category_selections_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_skill_category_selections_skill_category_id_fkey';
            columns: ['skill_category_id'];
            isOneToOne: false;
            referencedRelation: 'profile_skill_categories';
            referencedColumns: ['id'];
          },
        ];
      };
      cv_templates: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          id: string;
          is_default: boolean | null;
          is_public: boolean | null;
          layout_config: Json;
          name: string;
          preview_image_url: string | null;
          style_config: Json;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_default?: boolean | null;
          is_public?: boolean | null;
          layout_config?: Json;
          name: string;
          preview_image_url?: string | null;
          style_config?: Json;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          id?: string;
          is_default?: boolean | null;
          is_public?: boolean | null;
          layout_config?: Json;
          name?: string;
          preview_image_url?: string | null;
          style_config?: Json;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      cv_work_experience_selections: {
        Row: {
          created_at: string | null;
          cv_id: string;
          description_override: string | null;
          display_order: number | null;
          id: string;
          is_favorite: boolean | null;
          is_selected: boolean | null;
          selected_bullet_indices: number[] | null;
          updated_at: string | null;
          work_experience_id: string;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          selected_bullet_indices?: number[] | null;
          updated_at?: string | null;
          work_experience_id: string;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          description_override?: string | null;
          display_order?: number | null;
          id?: string;
          is_favorite?: boolean | null;
          is_selected?: boolean | null;
          selected_bullet_indices?: number[] | null;
          updated_at?: string | null;
          work_experience_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cv_work_experience_selections_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'cv_work_experience_selections_work_experience_id_fkey';
            columns: ['work_experience_id'];
            isOneToOne: false;
            referencedRelation: 'profile_work_experiences';
            referencedColumns: ['id'];
          },
        ];
      };
      job_applications: {
        Row: {
          applied_at: string | null;
          company_name: string;
          contact_email: string | null;
          contact_name: string | null;
          cover_letter_id: string | null;
          created_at: string | null;
          cv_id: string | null;
          deadline: string | null;
          id: string;
          is_archived: boolean | null;
          is_favorite: boolean | null;
          job_description: string | null;
          job_title: string;
          job_url: string | null;
          location: string | null;
          notes: string | null;
          salary_range: string | null;
          status: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          applied_at?: string | null;
          company_name: string;
          contact_email?: string | null;
          contact_name?: string | null;
          cover_letter_id?: string | null;
          created_at?: string | null;
          cv_id?: string | null;
          deadline?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_favorite?: boolean | null;
          job_description?: string | null;
          job_title: string;
          job_url?: string | null;
          location?: string | null;
          notes?: string | null;
          salary_range?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          applied_at?: string | null;
          company_name?: string;
          contact_email?: string | null;
          contact_name?: string | null;
          cover_letter_id?: string | null;
          created_at?: string | null;
          cv_id?: string | null;
          deadline?: string | null;
          id?: string;
          is_archived?: boolean | null;
          is_favorite?: boolean | null;
          job_description?: string | null;
          job_title?: string;
          job_url?: string | null;
          location?: string | null;
          notes?: string | null;
          salary_range?: string | null;
          status?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'job_applications_cover_letter_id_fkey';
            columns: ['cover_letter_id'];
            isOneToOne: false;
            referencedRelation: 'cover_letters';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'job_applications_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
        ];
      };
      job_fit_analyses: {
        Row: {
          application_id: string;
          created_at: string | null;
          gaps: string[] | null;
          id: string;
          overall_score: number | null;
          raw_analysis: Json | null;
          recommendations: string[] | null;
          strengths: string[] | null;
          summary: string | null;
          updated_at: string | null;
        };
        Insert: {
          application_id: string;
          created_at?: string | null;
          gaps?: string[] | null;
          id?: string;
          overall_score?: number | null;
          raw_analysis?: Json | null;
          recommendations?: string[] | null;
          strengths?: string[] | null;
          summary?: string | null;
          updated_at?: string | null;
        };
        Update: {
          application_id?: string;
          created_at?: string | null;
          gaps?: string[] | null;
          id?: string;
          overall_score?: number | null;
          raw_analysis?: Json | null;
          recommendations?: string[] | null;
          strengths?: string[] | null;
          summary?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'job_fit_analyses_application_id_fkey';
            columns: ['application_id'];
            isOneToOne: true;
            referencedRelation: 'job_applications';
            referencedColumns: ['id'];
          },
        ];
      };
      policy_acknowledgments: {
        Row: {
          acknowledged_at: string | null;
          id: string;
          policy_type: string;
          policy_version: string;
          user_id: string;
        };
        Insert: {
          acknowledged_at?: string | null;
          id?: string;
          policy_type: string;
          policy_version: string;
          user_id: string;
        };
        Update: {
          acknowledged_at?: string | null;
          id?: string;
          policy_type?: string;
          policy_version?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_certifications: {
        Row: {
          created_at: string | null;
          credential_id: string | null;
          date: string | null;
          display_order: number | null;
          document_name: string | null;
          document_url: string | null;
          expiry_date: string | null;
          id: string;
          issuer: string;
          name: string;
          storage_path: string | null;
          updated_at: string | null;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          credential_id?: string | null;
          date?: string | null;
          display_order?: number | null;
          document_name?: string | null;
          document_url?: string | null;
          expiry_date?: string | null;
          id?: string;
          issuer: string;
          name: string;
          storage_path?: string | null;
          updated_at?: string | null;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          credential_id?: string | null;
          date?: string | null;
          display_order?: number | null;
          document_name?: string | null;
          document_url?: string | null;
          expiry_date?: string | null;
          id?: string;
          issuer?: string;
          name?: string;
          storage_path?: string | null;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_educations: {
        Row: {
          created_at: string | null;
          degree: string;
          description: string | null;
          display_order: number | null;
          end_date: string | null;
          field: string | null;
          grade: string | null;
          id: string;
          institution: string;
          start_date: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          degree: string;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          field?: string | null;
          grade?: string | null;
          id?: string;
          institution: string;
          start_date: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          degree?: string;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          field?: string | null;
          grade?: string | null;
          id?: string;
          institution?: string;
          start_date?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_highlights: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          metric: string | null;
          title: string;
          type: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          metric?: string | null;
          title: string;
          type: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          metric?: string | null;
          title?: string;
          type?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_key_competences: {
        Row: {
          created_at: string | null;
          description: string | null;
          display_order: number | null;
          id: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          display_order?: number | null;
          id?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_motivation_vision: {
        Row: {
          career_goals: string | null;
          created_at: string | null;
          how_passions_relate: string | null;
          id: string;
          mission: string | null;
          passions: string[] | null;
          purpose: string | null;
          updated_at: string | null;
          user_id: string;
          vision: string | null;
          what_drives_you: string | null;
          why_this_field: string | null;
        };
        Insert: {
          career_goals?: string | null;
          created_at?: string | null;
          how_passions_relate?: string | null;
          id?: string;
          mission?: string | null;
          passions?: string[] | null;
          purpose?: string | null;
          updated_at?: string | null;
          user_id: string;
          vision?: string | null;
          what_drives_you?: string | null;
          why_this_field?: string | null;
        };
        Update: {
          career_goals?: string | null;
          created_at?: string | null;
          how_passions_relate?: string | null;
          id?: string;
          mission?: string | null;
          passions?: string[] | null;
          purpose?: string | null;
          updated_at?: string | null;
          user_id?: string;
          vision?: string | null;
          what_drives_you?: string | null;
          why_this_field?: string | null;
        };
        Relationships: [];
      };
      profile_photos: {
        Row: {
          created_at: string | null;
          display_order: number | null;
          file_size: number;
          filename: string;
          height: number | null;
          id: string;
          is_primary: boolean | null;
          mime_type: string;
          storage_path: string;
          updated_at: string | null;
          upload_source: string | null;
          user_id: string;
          width: number | null;
        };
        Insert: {
          created_at?: string | null;
          display_order?: number | null;
          file_size: number;
          filename: string;
          height?: number | null;
          id?: string;
          is_primary?: boolean | null;
          mime_type: string;
          storage_path: string;
          updated_at?: string | null;
          upload_source?: string | null;
          user_id: string;
          width?: number | null;
        };
        Update: {
          created_at?: string | null;
          display_order?: number | null;
          file_size?: number;
          filename?: string;
          height?: number | null;
          id?: string;
          is_primary?: boolean | null;
          mime_type?: string;
          storage_path?: string;
          updated_at?: string | null;
          upload_source?: string | null;
          user_id?: string;
          width?: number | null;
        };
        Relationships: [];
      };
      profile_projects: {
        Row: {
          created_at: string | null;
          current: boolean | null;
          description: string | null;
          display_order: number | null;
          end_date: string | null;
          id: string;
          name: string;
          outcome: string | null;
          role: string | null;
          start_date: string | null;
          technologies: string[] | null;
          updated_at: string | null;
          url: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          current?: boolean | null;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          id?: string;
          name: string;
          outcome?: string | null;
          role?: string | null;
          start_date?: string | null;
          technologies?: string[] | null;
          updated_at?: string | null;
          url?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          current?: boolean | null;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          id?: string;
          name?: string;
          outcome?: string | null;
          role?: string | null;
          start_date?: string | null;
          technologies?: string[] | null;
          updated_at?: string | null;
          url?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_references: {
        Row: {
          company: string;
          created_at: string | null;
          display_order: number | null;
          document_name: string | null;
          document_url: string | null;
          email: string | null;
          id: string;
          linked_position: string | null;
          name: string;
          phone: string | null;
          quote: string | null;
          relationship: string | null;
          storage_path: string | null;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          company: string;
          created_at?: string | null;
          display_order?: number | null;
          document_name?: string | null;
          document_url?: string | null;
          email?: string | null;
          id?: string;
          linked_position?: string | null;
          name: string;
          phone?: string | null;
          quote?: string | null;
          relationship?: string | null;
          storage_path?: string | null;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          company?: string;
          created_at?: string | null;
          display_order?: number | null;
          document_name?: string | null;
          document_url?: string | null;
          email?: string | null;
          id?: string;
          linked_position?: string | null;
          name?: string;
          phone?: string | null;
          quote?: string | null;
          relationship?: string | null;
          storage_path?: string | null;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_skill_categories: {
        Row: {
          category: string;
          created_at: string | null;
          display_order: number | null;
          id: string;
          skills: string[];
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          skills: string[];
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          display_order?: number | null;
          id?: string;
          skills?: string[];
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      profile_work_experiences: {
        Row: {
          bullets: string[] | null;
          company: string;
          created_at: string | null;
          current: boolean | null;
          description: string | null;
          display_order: number | null;
          end_date: string | null;
          id: string;
          location: string | null;
          start_date: string;
          title: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          bullets?: string[] | null;
          company: string;
          created_at?: string | null;
          current?: boolean | null;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          start_date: string;
          title: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          bullets?: string[] | null;
          company?: string;
          created_at?: string | null;
          current?: boolean | null;
          description?: string | null;
          display_order?: number | null;
          end_date?: string | null;
          id?: string;
          location?: string | null;
          start_date?: string;
          title?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      share_link_visits: {
        Row: {
          id: string;
          referrer: string | null;
          share_link_id: string;
          user_agent: string | null;
          visited_at: string | null;
          visitor_ip: string | null;
        };
        Insert: {
          id?: string;
          referrer?: string | null;
          share_link_id: string;
          user_agent?: string | null;
          visited_at?: string | null;
          visitor_ip?: string | null;
        };
        Update: {
          id?: string;
          referrer?: string | null;
          share_link_id?: string;
          user_agent?: string | null;
          visited_at?: string | null;
          visitor_ip?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'share_link_visits_share_link_id_fkey';
            columns: ['share_link_id'];
            isOneToOne: false;
            referencedRelation: 'share_links';
            referencedColumns: ['id'];
          },
        ];
      };
      share_links: {
        Row: {
          created_at: string | null;
          cv_id: string;
          expires_at: string | null;
          id: string;
          is_active: boolean | null;
          last_viewed_at: string | null;
          password_hash: string | null;
          privacy_level: string | null;
          share_token: string;
          updated_at: string | null;
          user_id: string;
          view_count: number | null;
        };
        Insert: {
          created_at?: string | null;
          cv_id: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_viewed_at?: string | null;
          password_hash?: string | null;
          privacy_level?: string | null;
          share_token: string;
          updated_at?: string | null;
          user_id: string;
          view_count?: number | null;
        };
        Update: {
          created_at?: string | null;
          cv_id?: string;
          expires_at?: string | null;
          id?: string;
          is_active?: boolean | null;
          last_viewed_at?: string | null;
          password_hash?: string | null;
          privacy_level?: string | null;
          share_token?: string;
          updated_at?: string | null;
          user_id?: string;
          view_count?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'share_links_cv_id_fkey';
            columns: ['cv_id'];
            isOneToOne: false;
            referencedRelation: 'cv_documents';
            referencedColumns: ['id'];
          },
        ];
      };
      uploaded_cvs: {
        Row: {
          created_at: string | null;
          error_message: string | null;
          extracted_text: string | null;
          extraction_metadata: Json | null;
          file_size: number | null;
          file_type: string;
          filename: string;
          id: string;
          status: string | null;
          storage_path: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          created_at?: string | null;
          error_message?: string | null;
          extracted_text?: string | null;
          extraction_metadata?: Json | null;
          file_size?: number | null;
          file_type: string;
          filename: string;
          id?: string;
          status?: string | null;
          storage_path?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          created_at?: string | null;
          error_message?: string | null;
          extracted_text?: string | null;
          extraction_metadata?: Json | null;
          file_size?: number | null;
          file_type?: string;
          filename?: string;
          id?: string;
          status?: string | null;
          storage_path?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
      user_profiles: {
        Row: {
          created_at: string | null;
          default_profile: string | null;
          default_tagline: string | null;
          github_url: string | null;
          id: string;
          linkedin_url: string | null;
          personal_motto: string | null;
          portfolio_url: string | null;
          preferred_language: string | null;
          primary_photo_id: string | null;
          privacy_policy_accepted_at: string | null;
          privacy_policy_version: string | null;
          timezone: string | null;
          updated_at: string | null;
          user_id: string;
          website_url: string | null;
        };
        Insert: {
          created_at?: string | null;
          default_profile?: string | null;
          default_tagline?: string | null;
          github_url?: string | null;
          id?: string;
          linkedin_url?: string | null;
          personal_motto?: string | null;
          portfolio_url?: string | null;
          preferred_language?: string | null;
          primary_photo_id?: string | null;
          privacy_policy_accepted_at?: string | null;
          privacy_policy_version?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          user_id: string;
          website_url?: string | null;
        };
        Update: {
          created_at?: string | null;
          default_profile?: string | null;
          default_tagline?: string | null;
          github_url?: string | null;
          id?: string;
          linkedin_url?: string | null;
          personal_motto?: string | null;
          portfolio_url?: string | null;
          preferred_language?: string | null;
          primary_photo_id?: string | null;
          privacy_policy_accepted_at?: string | null;
          privacy_policy_version?: string | null;
          timezone?: string | null;
          updated_at?: string | null;
          user_id?: string;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'user_profiles_primary_photo_id_fkey';
            columns: ['primary_photo_id'];
            isOneToOne: false;
            referencedRelation: 'profile_photos';
            referencedColumns: ['id'];
          },
        ];
      };
      werbeflaechen_entries: {
        Row: {
          ai_reasoning: Json | null;
          category_key: string;
          content: Json;
          created_at: string | null;
          cv_coverage: number | null;
          fit_reasoning: string | null;
          id: string;
          is_complete: boolean | null;
          job_match: number | null;
          language: string;
          row_number: number;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          ai_reasoning?: Json | null;
          category_key: string;
          content?: Json;
          created_at?: string | null;
          cv_coverage?: number | null;
          fit_reasoning?: string | null;
          id?: string;
          is_complete?: boolean | null;
          job_match?: number | null;
          language?: string;
          row_number: number;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          ai_reasoning?: Json | null;
          category_key?: string;
          content?: Json;
          created_at?: string | null;
          cv_coverage?: number | null;
          fit_reasoning?: string | null;
          id?: string;
          is_complete?: boolean | null;
          job_match?: number | null;
          language?: string;
          row_number?: number;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
