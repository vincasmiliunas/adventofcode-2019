.PHONY: w r

TARGET := 15.ts

w:
	@watchexec -w $(TARGET) -d 10 -c -r -n -- deno --allow-read $(TARGET)

r:
	@deno --allow-read $(d).ts
