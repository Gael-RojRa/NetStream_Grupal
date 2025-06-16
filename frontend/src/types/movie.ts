export interface Movie {
  status: string;
  data:   Datum[];
}

export interface Datum {
  id:                   number;
  name:                 string;
  slug:                 string;
  image:                string;
  nameTranslations:     null;
  overviewTranslations: null;
  aliases:              null;
  score:                number;
  runtime:              number;
  status:               Status;
  lastUpdated:          Date;
  year:                 string;
}

export interface Status {
  id:          number;
  name:        Name;
  recordType:  RecordType;
  keepUpdated: boolean;
}

export enum Name {
  Released = "Released",
}

export enum RecordType {
  Movie = "movie",
}
