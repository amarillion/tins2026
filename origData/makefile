# Set shell to bash instead of sh allow for brace expansion
SHELL=/bin/bash

DEST=../public/images
SRC=.

.PHONY: default
default: all ;

INFILES=Scene1 Scene2 Scene3 portraits Triggies
OUTFILES=$(patsubst %,$(DEST)/%.png,$(INFILES))
	
$(OUTFILES): $(DEST)/%.png: $(SRC)/%.aseprite
	aseprite -b $< --sheet $@

.PHONY: all
all: $(OUTFILES)
