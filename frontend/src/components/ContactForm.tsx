import React, { useState, ChangeEvent } from 'react';
import {
  Box,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Container,
  Grid as MuiGrid,
  Collapse,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormLabel,
  SelectChangeEvent,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  InputAdornment,
} from '@mui/material';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs, { Dayjs } from 'dayjs';
import 'dayjs/locale/fr';
import axios from 'axios';

const Grid = MuiGrid;

dayjs.locale('fr');

const HORAIRES = {
  matin: [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30'
  ],
  'après-midi': [
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30'
  ]
};

interface ContactFormData {
  typedemande: string;
  genre: string;
  genrePersonalise?: string;
  pronom: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  indicatifPays: string;
  disponibilite: Dayjs | null;
  heureDebut: string;
  heureFin: string;
  message: string;
}

const PAYS_INDICATIFS = [
  { 
    code: 'FR', 
    nom: 'France', 
    indicatif: '+33',
    format: '9 chiffres (ex: 612345678)'
  },
  { 
    code: 'BE', 
    nom: 'Belgique', 
    indicatif: '+32',
    format: '9 chiffres (ex: 470123456)'
  },
  { 
    code: 'CH', 
    nom: 'Suisse', 
    indicatif: '+41',
    format: '9 chiffres (ex: 791234567)'
  },
  { 
    code: 'LU', 
    nom: 'Luxembourg', 
    indicatif: '+352',
    format: '8 chiffres (ex: 62123456)'
  },
  { 
    code: 'MC', 
    nom: 'Monaco', 
    indicatif: '+377',
    format: '8-9 chiffres'
  },
  { 
    code: 'GB', 
    nom: 'Royaume-Uni', 
    indicatif: '+44',
    format: '10 chiffres (ex: 7700900123)'
  },
  { 
    code: 'DE', 
    nom: 'Allemagne', 
    indicatif: '+49',
    format: '10-11 chiffres'
  },
  { 
    code: 'ES', 
    nom: 'Espagne', 
    indicatif: '+34',
    format: '9 chiffres'
  },
  { 
    code: 'IT', 
    nom: 'Italie', 
    indicatif: '+39',
    format: '9-10 chiffres'
  },
  { 
    code: 'PT', 
    nom: 'Portugal', 
    indicatif: '+351',
    format: '9 chiffres'
  },
  { 
    code: 'NL', 
    nom: 'Pays-Bas', 
    indicatif: '+31',
    format: '9 chiffres'
  },
  { 
    code: 'US', 
    nom: 'États-Unis', 
    indicatif: '+1',
    format: '10 chiffres'
  },
  { 
    code: 'CA', 
    nom: 'Canada', 
    indicatif: '+1',
    format: '10 chiffres'
  },
  { 
    code: 'MA', 
    nom: 'Maroc', 
    indicatif: '+212',
    format: '9 chiffres'
  },
  { 
    code: 'DZ', 
    nom: 'Algérie', 
    indicatif: '+213',
    format: '9 chiffres'
  },
  { 
    code: 'TN', 
    nom: 'Tunisie', 
    indicatif: '+216',
    format: '8 chiffres'
  },
];

const ContactForm: React.FC = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    typedemande: '',
    genre: '',
    genrePersonalise: '',
    pronom: '',
    nom: '',
    prenom: '',
    email: '',
    telephone: '',
    indicatifPays: '+33', // Par défaut France
    disponibilite: null,
    heureDebut: '',
    heureFin: '',
    message: '',
  });

  const [openDatePicker, setOpenDatePicker] = useState(false);
  const [phoneError, setPhoneError] = useState<string>('');

  const getPhoneValidationForCountry = (indicatif: string): { regex: RegExp, format: string } => {
    const pays = PAYS_INDICATIFS.find(p => p.indicatif === indicatif);
    switch (indicatif) {
      case '+33': // France
      case '+32': // Belgique
      case '+41': // Suisse
      case '+34': // Espagne
      case '+351': // Portugal
      case '+31': // Pays-Bas
      case '+212': // Maroc
      case '+213': // Algérie
        return { regex: /^\d{9}$/, format: '9 chiffres' };
      case '+44': // UK
      case '+1': // US/Canada
        return { regex: /^\d{10}$/, format: '10 chiffres' };
      case '+352': // Luxembourg
      case '+216': // Tunisie
        return { regex: /^\d{8}$/, format: '8 chiffres' };
      case '+49': // Allemagne
        return { regex: /^\d{10,11}$/, format: '10-11 chiffres' };
      case '+39': // Italie
        return { regex: /^\d{9,10}$/, format: '9-10 chiffres' };
      case '+377': // Monaco
        return { regex: /^\d{8,9}$/, format: '8-9 chiffres' };
      default:
        return { regex: /^\d{9,10}$/, format: '9-10 chiffres' };
    }
  };

  const validatePhone = (phone: string): boolean => {
    const validation = getPhoneValidationForCountry(formData.indicatifPays);
    return validation.regex.test(phone);
  };

  const handleTextChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'telephone') {
      if (value && !validatePhone(value)) {
        const validation = getPhoneValidationForCountry(formData.indicatifPays);
        setPhoneError(`Le numéro doit contenir ${validation.format}`);
      } else {
        setPhoneError('');
      }
    }

    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
      ...(name === 'genre' && value !== 'Personnalisé' ? { pronom: '' } : {}),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.telephone && !validatePhone(formData.telephone)) {
      setPhoneError('Le numéro doit contenir 9 ou 10 chiffres');
      return;
    }

    try {
      const dataToSend = {
        ...formData,
        genre: formData.genre === 'Personnalisé' ? formData.genrePersonalise : formData.genre,
        telephone: formData.indicatifPays + formData.telephone.replace(/^0+/, ''),
        disponibilite: formData.typedemande === 'visite' && formData.disponibilite 
          ? formData.disponibilite.format('YYYY-MM-DD')
          : null,
        heureDebut: formData.typedemande === 'visite' && formData.heureDebut ? formData.heureDebut : null,
        heureFin: formData.typedemande === 'visite' && formData.heureFin ? formData.heureFin : null
      };

      await axios.post('http://localhost:3000/contact', dataToSend);
      alert('Message envoyé avec succès !');
      setFormData({
        typedemande: '',
        genre: '',
        genrePersonalise: '',
        pronom: '',
        nom: '',
        prenom: '',
        email: '',
        telephone: '',
        indicatifPays: '+33',
        disponibilite: null,
        heureDebut: '',
        heureFin: '',
        message: '',
      });
    } catch (error) {
      alert('Erreur lors de l\'envoi du message.');
      console.error(error);
    }
  };

  const handleDateSelect = (date: Dayjs | null) => {
    if (date) {
      setFormData(prev => ({
        ...prev,
        disponibilite: date,
        heureDebut: '',
        heureFin: ''
      }));
    }
  };

  const handleHeureSelect = (type: 'debut' | 'fin', heure: string) => {
    setFormData(prev => ({
      ...prev,
      [type === 'debut' ? 'heureDebut' : 'heureFin']: heure,
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: 12 }}>
      <Paper elevation={3} sx={{ p: 6, borderRadius: 3 }}>
        <Box component="form" onSubmit={handleSubmit}>
          <Typography variant="h4" align="center" gutterBottom sx={{ 
            mb: 4, 
            color: '#6B3176',
            fontWeight: 600 
          }}>
            CONTACTEZ L'AGENCE
          </Typography>
          
          <Box sx={{ mb: 4 }}>
            <FormControl component="fieldset">
              <FormLabel component="legend" sx={{ 
                color: '#6B3176',
                mb: 2,
                '&.Mui-focused': {
                  color: '#6B3176'
                }
              }}>
                Type de demande
              </FormLabel>
              <RadioGroup
                row
                name="typedemande"
                value={formData.typedemande}
                onChange={handleTextChange}
                sx={{
                  justifyContent: 'space-between',
                  '& .MuiFormControlLabel-root': {
                    mr: 4
                  }
                }}
              >
                <FormControlLabel 
                  value="visite" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#6B3176'
                        }
                      }}
                    />
                  } 
                  label="Demande de visite" 
                />
                <FormControlLabel 
                  value="rappel" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#6B3176'
                        }
                      }}
                    />
                  } 
                  label="Être rappelé" 
                />
                <FormControlLabel 
                  value="photos" 
                  control={
                    <Radio 
                      sx={{
                        '&.Mui-checked': {
                          color: '#6B3176'
                        }
                      }}
                    />
                  } 
                  label="Plus de photos" 
                />
              </RadioGroup>
            </FormControl>
          </Box>
          
          <Box sx={{ 
            display: 'flex', 
            gap: 6,
            flexDirection: { xs: 'column', md: 'row' }
          }}>
            <Box sx={{ 
              flex: { xs: '1', md: '3' },
              '& .MuiOutlinedInput-root': {
                '&.Mui-focused fieldset': {
                  borderColor: '#6B3176'
                }
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: '#6B3176'
              },
              '& .MuiRadio-root.Mui-checked': {
                color: '#6B3176'
              }
            }}>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <InputLabel>Genre</InputLabel>
                <Select
                  name="genre"
                  value={formData.genre}
                  onChange={handleSelectChange}
                  label="Genre"
                  required
                >
                  <MenuItem value="M.">M.</MenuItem>
                  <MenuItem value="Mme">Mme</MenuItem>
                  <MenuItem value="Non précisé">Non précisé</MenuItem>
                  <MenuItem value="Personnalisé">Personnalisé</MenuItem>
                </Select>
              </FormControl>

              <Collapse in={formData.genre === 'Personnalisé'} timeout="auto">
                <Box sx={{ mb: 3, p: 2, bgcolor: 'background.default', borderRadius: 1 }}>
                  <TextField
                    fullWidth
                    label="Genre personnalisé"
                    name="genrePersonalise"
                    value={formData.genrePersonalise}
                    onChange={handleTextChange}
                    required={formData.genre === 'Personnalisé'}
                    placeholder="Comment souhaitez-vous être appelé(e) ?"
                  />
                  <FormControl component="fieldset" sx={{ mt: 2 }}>
                    <FormLabel component="legend">Merci de vous adresser à moi comme :</FormLabel>
                    <RadioGroup
                      name="pronom"
                      value={formData.pronom}
                      onChange={handleTextChange}
                      row
                      sx={{ justifyContent: 'space-around', mt: 1 }}
                    >
                      <FormControlLabel value="homme" control={<Radio />} label="Homme" />
                      <FormControlLabel value="femme" control={<Radio />} label="Femme" />
                      <FormControlLabel value="autre" control={<Radio />} label="Autre" />
                    </RadioGroup>
                  </FormControl>
                </Box>
              </Collapse>

              <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
                <TextField
                  fullWidth
                  label="Nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleTextChange}
                  required
                />
                <TextField
                  fullWidth
                  label="Prénom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleTextChange}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleTextChange}
                  required
                />
              </Box>

              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Téléphone"
                  name="telephone"
                  value={formData.telephone}
                  onChange={handleTextChange}
                  required
                  error={!!phoneError}
                  helperText={phoneError}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Select
                          value={formData.indicatifPays}
                          onChange={(e) => {
                            setFormData(prev => ({
                              ...prev,
                              indicatifPays: e.target.value,
                              telephone: '' // Reset phone number when country changes
                            }));
                            setPhoneError('');
                          }}
                          sx={{ 
                            minWidth: 120,
                            '& .MuiSelect-select': {
                              py: 0
                            }
                          }}
                        >
                          {PAYS_INDICATIFS.map((pays) => (
                            <MenuItem key={pays.code} value={pays.indicatif}>
                              {pays.code} - {pays.nom} ({pays.indicatif})
                            </MenuItem>
                          ))}
                        </Select>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiInputAdornment-root': {
                      mr: 1
                    }
                  }}
                />
              </Box>

              <Collapse in={formData.typedemande === 'visite'}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="subtitle1" sx={{ 
                    mb: 2,
                    color: '#6B3176',
                    fontWeight: 500
                  }}>
                    Disponibilité pour une visite
                  </Typography>
                  <TextField
                    fullWidth
                    label="Sélectionnez une date et un horaire"
                    value={formData.disponibilite ? `${formData.disponibilite.format('DD/MM/YYYY')}${formData.heureDebut && formData.heureFin ? ` de ${formData.heureDebut} à ${formData.heureFin}` : ''}` : ''}
                    onClick={() => setOpenDatePicker(true)}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Box>
              </Collapse>
            </Box>

            <Box sx={{ 
              flex: { xs: '1', md: '2' },
              borderLeft: { xs: 'none', md: '1px solid #6B3176' },
              borderTop: { xs: '1px solid #6B3176', md: 'none' },
              pl: { xs: 0, md: 8 },
              pt: { xs: 4, md: 2 },
              display: 'flex',
              flexDirection: 'column',
              height: '100%'
            }}>
              <Typography variant="subtitle1" sx={{ 
                fontWeight: 500,
                color: '#6B3176',
                mb: 2
              }}>
                Votre message
              </Typography>
              <TextField
                fullWidth
                multiline
                rows={10}
                name="message"
                value={formData.message}
                onChange={handleTextChange}
                required
                sx={{ 
                  flexGrow: 1,
                  '& .MuiOutlinedInput-root': {
                    height: '100%'
                  }
                }}
              />
            </Box>
          </Box>

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ 
                minWidth: 200,
                textTransform: 'none',
                fontSize: '1rem',
                py: 1,
                bgcolor: '#fbac19',
                '&:hover': {
                  bgcolor: '#e09707'
                }
              }}
            >
              Envoyer
            </Button>
          </Box>
        </Box>
      </Paper>

      <Dialog 
        open={openDatePicker} 
        onClose={() => setOpenDatePicker(false)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            '& .MuiPickersDay-root.Mui-selected': {
              backgroundColor: '#6B3176',
              '&:hover': {
                backgroundColor: '#4b1d8b'
              }
            },
            '& .MuiPickersDay-root.Mui-selected:focus': {
              backgroundColor: '#6B3176'
            },
            '& .MuiPickersCalendarHeader-label': {
              color: '#6B3176'
            }
          }
        }}
      >
        <DialogTitle sx={{ color: '#6B3176', fontWeight: 500 }}>Choisissez votre disponibilité</DialogTitle>
        <DialogContent>
          <Box sx={{ 
            display: 'flex', 
            gap: 4,
            flexDirection: { xs: 'column', sm: 'row' }
          }}>
            <LocalizationProvider dateAdapter={AdapterDayjs}>
              <DateCalendar 
                value={formData.disponibilite}
                onChange={handleDateSelect}
                sx={{ 
                  flex: '1',
                  '& .MuiPickersDay-root.Mui-selected': {
                    backgroundColor: '#6B3176',
                    '&:hover': {
                      backgroundColor: '#4b1d8b'
                    }
                  }
                }}
              />
            </LocalizationProvider>
            
            <Box sx={{ 
              flex: '1',
              borderLeft: { xs: 'none', sm: '1px solid #6B3176' },
              pl: { xs: 0, sm: 4 },
              pt: { xs: 2, sm: 0 }
            }}>
              <Typography variant="subtitle1" gutterBottom sx={{ color: '#6B3176', fontWeight: 500, mb: 3 }}>
                Sélectionnez votre plage horaire
              </Typography>
              
              <Box sx={{ mb: 4 }}>
                <Typography variant="subtitle2" sx={{ color: '#6B3176', mb: 1 }}>
                  Heure de début
                </Typography>
                <List sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}>
                  {HORAIRES.matin.map((heure) => (
                    <ListItem key={heure} disablePadding>
                      <ListItemButton
                        onClick={() => handleHeureSelect('debut', heure)}
                        selected={formData.heureDebut === heure}
                        disabled={!!formData.heureFin && heure >= formData.heureFin}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: '#6B3176',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#5a2963',
                            },
                          },
                        }}
                      >
                        <ListItemText primary={heure} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ color: '#6B3176', mb: 1 }}>
                  Heure de fin
                </Typography>
                <List sx={{ 
                  maxHeight: 200, 
                  overflow: 'auto',
                  bgcolor: 'background.paper',
                  borderRadius: 1
                }}>
                  {HORAIRES['après-midi'].map((heure) => (
                    <ListItem key={heure} disablePadding>
                      <ListItemButton
                        onClick={() => handleHeureSelect('fin', heure)}
                        selected={formData.heureFin === heure}
                        disabled={Boolean(formData.heureDebut && heure <= formData.heureDebut)}
                        sx={{
                          '&.Mui-selected': {
                            backgroundColor: '#6B3176',
                            color: 'white',
                            '&:hover': {
                              backgroundColor: '#5a2963',
                            },
                          },
                        }}
                      >
                        <ListItemText primary={heure} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setOpenDatePicker(false)}
            sx={{ 
              color: '#6B3176',
              '&:hover': {
                backgroundColor: 'rgba(107, 49, 118, 0.08)'
              }
            }}
          >
            Annuler
          </Button>
          <Button 
            variant="contained"
            onClick={() => setOpenDatePicker(false)}
            sx={{ 
              bgcolor: '#fbac19',
              '&:hover': {
                bgcolor: '#e09707'
              }
            }}
          >
            Valider
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ContactForm; 