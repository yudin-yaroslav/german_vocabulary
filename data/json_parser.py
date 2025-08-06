import os
import json

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



def get_noun_data(noun, existing=None):
	article = ""
	word = noun.split(", ")[0]

	for art in ("der", "die", "das"):
		if art in noun:
			article = art
			word = noun.split(", ")[0][4:]

	plural = ""
	if len(noun.split(", ")) > 1:
		plural = noun.split(", ")[1]

	existing = existing or {}

	return {
		"article": article,
		"word": word,
		"plural": plural,
		"russian": existing.get("russian") or safe_translate(word, "de", "ru").capitalize(),
		"ukrainian": existing.get("ukrainian") or safe_translate(word, "de", "uk").capitalize(),
		"english": existing.get("english") or safe_translate(word, "de", "en").capitalize(),
	}




def get_verb_data(verb, existing=None):
	existing = existing or {}

	present = {
		"ich": conjugate(verb, PRESENT, person=1, number=SG),
		"du": conjugate(verb, PRESENT, person=2, number=SG),
		"er_sie_es": conjugate(verb, PRESENT, person=3, number=SG),
		"wir": conjugate(verb, PRESENT, person=1, number=PL),
		"ihr": conjugate(verb, PRESENT, person=2, number=PL),
		"sie_Sie": conjugate(verb, PRESENT, person=3, number=PL),
	}

	return {
		"word": verb,
		"present": present,
		"perfekt": existing.get("perfekt") or conjugate(verb, "ppart"),
		"russian": existing.get("russian") or safe_translate(verb, "de", "ru"),
		"ukrainian": existing.get("ukrainian") or safe_translate(verb, "de", "uk"),
		"english": existing.get("english") or safe_translate(verb, "de", "en"),
	}


def get_simple_entry(line, existing=None):
	existing = existing or {}

	return {
		"word": line,
		"russian": existing.get("russian") or safe_translate(line, "de", "ru"),
		"ukrainian": existing.get("ukrainian") or safe_translate(line, "de", "uk"),
		"english": existing.get("english") or safe_translate(line, "de", "en"),
	}

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
		result = existing_data

		index = 0
		theme = ""
		subtheme = ""

		while index < len(lines):
			line = lines[index]

			if line.startswith("-- "):
				theme = line[3:].strip()
				print(theme)
				if theme not in result:
					result[theme] = {}
			elif line.startswith("- "):
				subtheme = line[2:].strip()
				print(subtheme)
				if subtheme not in result[theme]:
					result[theme][subtheme] = {
						"noun": [],
						"verb": [],
						"phrase": [],
						"adj": [],
						"misc": [],
					}
			elif line.strip():
				flag = line[-2]
				entry_text = line[:-3]

				category_map = {
					"n": ("noun", get_noun_data, lambda text: text.split(", ")[0][4:] if any(text.startswith(a) for a in ("der ", "die ", "das ")) else text),
					"v": ("verb", get_verb_data, lambda text: text),
					"p": ("phrase", get_simple_entry, lambda text: text),
					"m": ("misc", get_simple_entry, lambda text: text),
					"a": ("adj", get_simple_entry, lambda text: text),
				}
				
				if flag not in category_map:
					raise Exception(f"No speech part flag in '{line[:-1]}'")
				
				category, data_func, key_func = category_map[flag]
				items = result[theme][subtheme][category]
				
				search_key = key_func(entry_text)
				existing = next((item for item in items if item["word"] == search_key), None)
				new_data = data_func(entry_text, existing)
				
				if existing:
					merge_entry(existing, new_data)
				else:
					items.append(new_data)
			index += 1

	with open("data/vocabulary.json", "w", encoding="utf-8") as f:
		json.dump(result, f, ensure_ascii=False, indent=4)
