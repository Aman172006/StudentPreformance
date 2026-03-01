from pydantic import BaseModel, Field

#school,sex,age,studytime,failures,internet,absences,G1,G2
class StudentPerformanceModel(BaseModel):
    # the original dataset used "sex" and "studytime" names; the API
    # exposes more descriptive names but accepts the originals via aliases
    gender: str = Field(..., alias="sex")
    age: int
    study_time: int = Field(..., alias="studytime")
    failures: int
    internet: str
    absences: int
    G1: int
    G2: int

    class Config:
        allow_population_by_field_name = True