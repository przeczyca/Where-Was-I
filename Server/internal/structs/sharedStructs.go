package structs

type VisitedLocation struct {
	GNIS_ID  string
	Color_ID int
	Saved    bool
	Action   string
}

type Color struct {
	Action      string
	Color_ID    int
	Description string
	HexValue    string
}
