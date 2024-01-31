import { Lot } from './Lot';
import { SelectArtisan } from './SelectArtisan';
import { Slot } from './Slot';
import { FileData } from './FileData';

export interface CreateConsultationForm {
    lots: Lot[];
    selectedArtisans: SelectArtisan[];
    description: string;
    file: FileData | null;
    slots: Slot[];
}
