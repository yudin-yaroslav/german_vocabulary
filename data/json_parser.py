import os
import json
import pprint

from pattern.de import (PL, PRESENT, SG, conjugate)
from deep_translator import GoogleTranslator

def safe_translate(text, source_lang, target_lang):
	try:
		result = GoogleTranslator(source=source_lang, target=target_lang).translate(text)
		print(result)
		return result
	except Exception as e:
		print(f"Error translating '{text}' from {source_lang} to {target_lang}: {e}")
		return ""


def get_noun_data(noun):
	article = ""
	word = noun.split(", ")[0]

	for art in ("der", "die", "das"):
		if art in noun:
			article = art
			word = noun.split(", ")[0][4:]

	plural = ""
	if len(noun.split(", ")) > 1:
		plural = noun.split(", ")[1]

	translation_ru = safe_translate(word, "de", "ru")
	translation_uk = safe_translate(word, "de", "uk")
	translation_en = safe_translate(word, "de", "en")

	return {
		"article": article,
		"word": word,
		"plural": plural,
		"russian": translation_ru,
		"ukrainian": translation_uk,
		"english": translation_en,
	}


def get_verb_data(verb):
	present = {
		"ich": conjugate(verb, PRESENT, person=1, number=SG),
		"du": conjugate(verb, PRESENT, person=2, number=SG),
		"er_sie_es": conjugate(verb, PRESENT, person=3, number=SG),
		"wir": conjugate(verb, PRESENT, person=1, number=PL),
		"ihr": conjugate(verb, PRESENT, person=2, number=PL),
		"sie_Sie": conjugate(verb, PRESENT, person=3, number=PL),
	}

	perfekt = conjugate(verb, "ppart")

	translation_ru = safe_translate(verb, "de", "ru")
	translation_uk = safe_translate(verb, "de", "uk")
	translation_en = safe_translate(verb, "de", "en")

	return {"word": verb, "present": present, "perfekt": perfekt, "russian": translation_ru, "ukrainian": translation_uk, "english": translation_en}


def get_phrase_data(line):
	translation_ru = safe_translate(line, "de", "ru")
	translation_uk = safe_translate(line, "de", "uk")
	translation_en = safe_translate(line, "de", "en")

	return {"word": line, "russian": translation_ru, "ukrainian": translation_uk, "english": translation_en}


def get_adj_data(line):
	translation_ru = safe_translate(line, "de", "ru")
	translation_uk = safe_translate(line, "de", "uk")
	translation_en = safe_translate(line, "de", "en")

	return {"word": line, "russian": translation_ru, "ukrainian": translation_uk, "english": translation_en}


def get_misc_data(line):
	translation_ru = safe_translate(line, "de", "ru")
	translation_uk = safe_translate(line, "de", "uk")
	translation_en = safe_translate(line, "de", "en")

	return {"word": line, "russian": translation_ru, "ukrainian": translation_uk, "english": translation_en}


def merge_entry(old_entry, new_entry):
	for key, val in new_entry.items():
		if key not in old_entry or not old_entry[key]:
			old_entry[key] = val
	return old_entry

if __name__ == "__main__":
	existing_data = {}
	if os.path.exists("data/vocabulary.json"):
		with open("data/vocabulary.json", "r", encoding="utf-8") as f:
			existing_data = json.load(f)

	with open("data/temp_file.txt", "r", encoding="utf-8") as file:
		lines = file.readlines()
		result = existing_data  # start from existing data

		index = 0
		theme = ""
		subtheme = ""

		while index < len(lines):
			line = lines[index]

			if line.startswith("-- "):
				theme = line[3:].strip()
				if theme not in result:
					result[theme] = {}
			elif line.startswith("- "):
				subtheme = line[2:].strip()
				if subtheme not in result[theme]:
					result[theme][subtheme] = {
						"noun": [],
						"verb": [],
						"phrase": [],
						"adj": [],
						"misc": [],
					}
			elif line.strip():
				# Determine part of speech flag
				flag = line[-2]
				entry_text = line[:-3]

				# Prepare new data dict based on part of speech
				if flag == "n":
					new_data = get_noun_data(entry_text)
					# Find existing entry in nouns list by word
					nouns = result[theme][subtheme]["noun"]
					existing = next((item for item in nouns if item["word"] == new_data["word"]), None)
					if existing:
						merge_entry(existing, new_data)
					else:
						nouns.append(new_data)

				elif flag == "v":
					new_data = get_verb_data(entry_text)
					verbs = result[theme][subtheme]["verb"]
					existing = next((item for item in verbs if item["word"] == new_data["word"]), None)
					if existing:
						merge_entry(existing, new_data)
					else:
						verbs.append(new_data)

				elif flag == "p":
					new_data = get_phrase_data(entry_text)
					phrases = result[theme][subtheme]["phrase"]
					existing = next((item for item in phrases if item["word"] == new_data["word"]), None)
					if existing:
						merge_entry(existing, new_data)
					else:
						phrases.append(new_data)

				elif flag == "m":
					new_data = get_misc_data(entry_text)
					misc = result[theme][subtheme]["misc"]
					existing = next((item for item in misc if item["word"] == new_data["word"]), None)
					if existing:
						merge_entry(existing, new_data)
					else:
						misc.append(new_data)

				elif flag == "a":
					new_data = get_adj_data(entry_text)
					adjs = result[theme][subtheme]["adj"]
					existing = next((item for item in adjs if item["word"] == new_data["word"]), None)
					if existing:
						merge_entry(existing, new_data)
					else:
						adjs.append(new_data)

				else:
					raise Exception(f"No speech part flag in '{line[:-1]}'")

			index += 1

	with open("data/vocabulary.json", "w", encoding="utf-8") as f:
		json.dump(result, f, ensure_ascii=False, indent=4)
