package domain

type DBConfig struct {
	User string
    Pass string
    SSL  string
    Name string
    Host string
    Port string
}

type Server struct {
	Host string
	Port string
}