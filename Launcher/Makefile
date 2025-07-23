.PHONY: all

NODE_DIR = node_modules
NODE_BSRC_DIR = $(NODE_DIR)/.bin

LESSC_BIN ?= $(NODE_BSRC_DIR)/lessc
TIME_BIN ?= time
LESS_FLAGS = --source-map-map-inline --autoprefix="> 5%, last 2 versions, ie >= 9"

TARGET_DIR = app
TARGET_DIR_CSS = $(TARGET_DIR)/css
TARGET_BUNDLE_CSS = $(TARGET_DIR_CSS)/main.css
TARGETS = $(TARGET_BUNDLE_CSS)

SRC_DIR = app
SRC_DIR_CSS = $(SRC_DIR)/css
SRC_FILES_LESS = find $(SRC_DIR_CSS) -type f \( -name "*.less" \)
SRC_MAIN_LESS = $(SRC_DIR_CSS)/main.less

define LESSC_CMD
	@echo "[$(LESSC_BIN)] Compile $2 file"
	@echo "[$(LESSC_BIN)] This file has changed : $3"
	@$(TIME_BIN) $(LESSC_BIN) $(LESS_FLAGS) $1 $2
	@echo ""
endef

$(TARGET_BUNDLE_CSS): $(shell $(SRC_FILES_LESS))
	$(call LESSC_CMD,$(SRC_MAIN_LESS),$@,$?)

default: $(TARGETS)