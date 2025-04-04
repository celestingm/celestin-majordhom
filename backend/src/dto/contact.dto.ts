import { IsString, IsEmail, IsNotEmpty, MinLength, Matches, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateContactDto {
  @IsString()
  @IsNotEmpty()
  typedemande: string;

  @IsString()
  @IsNotEmpty()
  genre: string;

  @IsString()
  @IsOptional()
  pronom: string;

  @IsString()
  @IsNotEmpty()
  nom: string;

  @IsString()
  @IsNotEmpty()
  prenom: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @Matches(/^\+[1-9]\d{1,14}$/, {
    message: 'Le numéro de téléphone doit être au format international (ex: +33612345678)',
  })
  telephone: string;

  @IsString()
  @IsOptional()
  disponibilite: string | null;

  @IsString()
  @IsOptional()
  heureDebut: string | null;

  @IsString()
  @IsOptional()
  heureFin: string | null;

  @IsString()
  @MinLength(10)
  message: string;
} 