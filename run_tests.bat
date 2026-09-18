@echo off
title Test Suite Runner - Distributed Commerce Platform
echo ==============================================================================
echo EXECUTING AUTOMATED TEST SUITE (TC01 to TC10 - Slide 7)
echo ==============================================================================
python -m unittest backend.tests.test_suite
echo.
pause
