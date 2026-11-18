# Kontrakt REST API – Lab 6

Wersja: v1. Prefiks wszystkich adresów: `/api/v1`.
Format danych: JSON (UTF-8). Pola w camelCase, daty w ISO 8601.

## 1. Zasoby

### students
Atrybuty: id, fullName, email, city, fieldOfStudy, year, active, createdAt.
Relacje: student ma wiele kursów (relacja wiele-do-wielu przez zapisy).

```json
{
  "id": 2,
  "fullName": "Piotr Wiśniewski",
  "email": "piotr.wisniewski@example.com",
  "city": "Lublin",
  "fieldOfStudy": "Informatyka",
  "year": 3,
  "active": true,
  "createdAt": "2026-10-10T10:00:00.000Z"
}
```

### courses
Atrybuty: id, name, ects. Relacje: kurs ma wielu studentów.

```json
{ "id": 1, "name": "Aplikacje internetowe", "ects": 5 }
```

### enrollments (zapisy)
Relacja student–kurs z atrybutami własnymi (ocena, data zapisu). Klucz
złożony (studentId, courseId). Udostępniany jako zasób zagnieżdżony
`/students/:id/courses`.

```json
{
  "courseId": 1,
  "courseName": "Aplikacje internetowe",
  "ects": 5,
  "grade": 4.5,
  "enrolledAt": "2026-10-10T10:00:00.000Z"
}
```

Reprezentacja nie odpowiada wprost tabelom: snake_case zamieniany jest na
camelCase, a `active` (TINYINT) na wartość logiczną.

## 2. Zasady projektowania URI

- adres opisuje zasób (rzeczowniki w liczbie mnogiej), operację określa metoda HTTP,
- małe litery, wyrazy rozdzielane myślnikiem,
- zagnieżdżenie najwyżej jeden poziom (`/students/:id/courses`),
- filtrowanie, sortowanie i paginacja w parametrach zapytania.

### Poprawa błędnych adresów

| Błędny adres | Błąd | Poprawnie |
|---|---|---|
| `GET /getAllStudents` | czasownik w adresie, brak prefiksu wersji | `GET /api/v1/students` |
| `POST /students/create` | czasownik w adresie (operację określa POST) | `POST /api/v1/students` |
| `GET /Students/2/Courses/5/Grade` | wielkie litery, zagnieżdżenie na dwa poziomy, ocena nie jest zasobem | `GET /api/v1/students/2/courses` (ocena jest polem zapisu) |
| `DELETE /deleteStudent?id=2` | czasownik, identyfikator w query zamiast w ścieżce | `DELETE /api/v1/students/2` |
| `GET /students/lublin` | filtr zapisany jako zasób (`lublin` wygląda jak id) | `GET /api/v1/students?city=Lublin` |

## 3. Kontrakt endpointów

### students

| Metoda i endpoint | Operacja | Kody odpowiedzi |
|---|---|---|
| GET /api/v1/students | lista z filtrowaniem, sortowaniem i paginacją | 200, 503 |
| GET /api/v1/students/:id | szczegóły studenta | 200, 400, 404 |
| POST /api/v1/students | utworzenie studenta | 201, 400, 409 |
| PUT /api/v1/students/:id | zastąpienie danych studenta | 200, 400, 404, 409 |
| PATCH /api/v1/students/:id | częściowa aktualizacja | 200, 400, 404, 409 |
| DELETE /api/v1/students/:id | usunięcie studenta | 204, 400, 404 |
| GET /api/v1/students/:id/courses | kursy i oceny studenta | 200, 400, 404 |

### courses

| Metoda i endpoint | Operacja | Kody odpowiedzi |
|---|---|---|
| GET /api/v1/courses | lista kursów (paginacja) | 200 |
| GET /api/v1/courses/:id | szczegóły kursu | 200, 400, 404 |
| POST /api/v1/courses | utworzenie kursu | 201, 400 |
| PUT /api/v1/courses/:id | zastąpienie danych kursu | 200, 400, 404 |
| PATCH /api/v1/courses/:id | częściowa aktualizacja | 200, 400, 404 |
| DELETE /api/v1/courses/:id | usunięcie kursu | 204, 400, 404 |

### enrollments (zasób zagnieżdżony)

| Metoda i endpoint | Operacja | Kody odpowiedzi |
|---|---|---|
| POST /api/v1/students/:id/courses | zapisanie studenta na kurs | 201, 400, 404, 409 |
| PATCH /api/v1/students/:id/courses/:courseId | zmiana oceny | 200, 400, 404 |
| DELETE /api/v1/students/:id/courses/:courseId | wypisanie z kursu | 204, 404 |

W Lab 6 implementowane są endpointy zasobu students (w tym
`/students/:id/courses` z metodą GET). Pozostałe stanowią projekt kontraktu.

## 4. Konwencje odpowiedzi

- kolekcje: `{ "items": [...], "page": 1, "limit": 10, "total": 42, "pages": 5 }`,
- pojedynczy zasób: bez dodatkowej otoczki,
- błędy: `application/problem+json` (RFC 9457),
- utworzenie zasobu: 201 + nagłówek `Location`,
- usunięcie: 204 bez treści.

### Parametry kolekcji `GET /students`

| Parametr | Znaczenie | Domyślnie |
|---|---|---|
| city | filtr po mieście (równość) | brak |
| fieldOfStudy | filtr po kierunku (równość) | brak |
| sort | fullName, city, year, createdAt | fullName |
| order | asc, desc | asc |
| page | numer strony | 1 |
| limit | rozmiar strony, 1–50 | 10 |

Sortowanie jest stabilne (drugi klucz: `id`).

### Decyzja: niepoprawne wartości page i limit

Niepoprawne lub spoza zakresu wartości (`limit=abc`, `page=-1`, `limit=1000`)
nie powodują błędu. API przyjmuje wartość domyślną lub graniczną
(page ≥ 1, limit 1–50). Nieznane pole `sort` zastępowane jest `fullName`.
Uzasadnienie: parametry listy są opcjonalne i nie zmieniają sensu zasobu,
a klient dostaje w odpowiedzi faktycznie użyte `page` i `limit`.
Strona poza zakresem zwraca 200 z pustą tablicą `items`.

## 5. Format błędów (application/problem+json)

```json
{
  "type": "about:blank",
  "title": "Bad Request",
  "status": 400,
  "detail": "Niepoprawne dane wejściowe.",
  "instance": "/api/v1/students",
  "errors": [{ "field": "email", "message": "Niepoprawny adres e-mail" }]
}
```

| Kod | Zastosowanie |
|---|---|
| 400 | niepoprawne dane wejściowe, niepoprawny identyfikator, niepoprawny JSON |
| 404 | zasób lub adres nie istnieje |
| 409 | konflikt, np. duplikat adresu e-mail |
| 503 | baza danych niedostępna |
| 500 | nieoczekiwany błąd (bez szczegółów w odpowiedzi) |

### Decyzja: 400 czy 422 dla błędów walidacji

Przyjęto **400 Bad Request** dla wszystkich błędów walidacji danych
wejściowych. Uzasadnienie: jeden kod dla błędów składni i wartości upraszcza
obsługę po stronie klienta, a odpowiedź i tak zawiera szczegóły w polu
`errors`. Kod 422 byłby uzasadniony przy rozróżnianiu poprawnego składniowo
żądania, które narusza regułę biznesową (np. przekroczenie limitu 30 ECTS);
w Lab 6 nie jest używany.