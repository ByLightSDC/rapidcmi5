def safe_assert(condition, message):
    if not condition:
        raise Exception(message)


def run_visible_tests():
    result = convert_to_ordinal("hello")
    desired_result = [104, 101, 108, 108, 111]
    safe_assert(result == desired_result, f"Example Test 1 failed: {
                result} not equal to {desired_result}")

    result = convert_to_ordinal("world")
    desired_result = [119, 111, 114, 108, 100]
    safe_assert(result == desired_result, f"Example Test 2 failed: {
                result} not equal to {desired_result}")


def run_hidden_tests():
    result = convert_to_ordinal("test")
    desired_result = [116, 101, 115, 116]
    safe_assert(result == desired_result, f"Hidden Test 1 failed!")

    result = convert_to_ordinal("code")
    desired_result = [99, 111, 100, 101]
    safe_assert(result == desired_result, f"Hidden Test 2 failed!")


print("Running visible tests...")
run_visible_tests()
print("Visible tests passed!")

print("Running hidden tests...")
run_hidden_tests()
print("Hidden tests passed!")

print("All tests passed successfully!")
