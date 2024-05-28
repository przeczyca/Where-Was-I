package structs

type VisitedLocation struct {
	GNIS_ID string
	Saved   bool
	Action  string
}

type Color struct {
	Color_ID    int
	Description string
	HexValue    string
}
