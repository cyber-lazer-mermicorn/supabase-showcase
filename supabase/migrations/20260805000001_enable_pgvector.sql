-- Migration: enable pgvector extension
-- Run order: 1 of 3

create extension if not exists vector;
