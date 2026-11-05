package com.dandi.hospital.visit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.OptBoolean;

import java.time.LocalDateTime;

public record VisitTimeRequest(@JsonFormat(lenient = OptBoolean.FALSE) LocalDateTime time) {}
