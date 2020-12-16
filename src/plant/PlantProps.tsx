import { Photo } from "../core/usePhoto";

export interface PlantProps{
    _id?: string;
    name: string;
    description: string;
    type: string;
    loaded?: boolean;
    version?: number;
    latitude?: number;
    longitude?: number;
    photo?: Photo;
}