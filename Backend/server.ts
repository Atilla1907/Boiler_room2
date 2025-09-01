import express from "express";
//
type User = {
    id: string;
    spins: number;
    history: { prize: number; date: string}[];
};