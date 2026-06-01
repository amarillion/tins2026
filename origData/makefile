# Set shell to bash instead of sh allow for brace expansion
SHELL=/bin/bash

DEST=../public/images
SRC=.

.PHONY: default
default: all ;

TILESET=$(DEST)/tileset.png

INFILES=Scene1 Scene2 Scene3 portraits Triggies container
OUTFILES=$(patsubst %,$(DEST)/%.png,$(INFILES))


$(OUTFILES): $(DEST)/%.png: $(SRC)/%.aseprite
	aseprite -b $< --sheet $@

$(TILESET): $(DEST)/%.png: $(SRC)/%.svg
	inkscape --export-png=$@ $<

.PHONY: all
all: $(OUTFILES) $(TILESET)
