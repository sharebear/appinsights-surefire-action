import {convertableToString, parseStringPromise} from 'xml2js';

type TestCaseResult = 
    | 'passed'
    | 'failed'
    | 'error'
    | 'skipped'

interface TestCase {
    classname: string
    name: string
    time: number
    result: TestCaseResult
}

const parseSurefireTime = (input: string): number => {
    // FIXME: This returns NaN if it can't be parsed, should handle this case
    return parseFloat(input)
}

// FIXME: Should return a Result type and check for some error cases
const parseSurefireXML = async (input: convertableToString): Promise<TestCase[]> => {
    const parsedXML = await parseStringPromise(input)
    return parsedXML.testsuite.testcase.map((tc: any): TestCase => {
        return {
            classname: tc.$.classname,
            name: tc.$.name,
            time: parseSurefireTime(tc.$.time),
            result: tc.error ? 'error' : (tc.failure ? 'failed' : (tc.skipped ? 'skipped' : 'passed'))
        }
    })
}

export default parseSurefireXML
