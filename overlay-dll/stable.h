#pragma once

#define _SILENCE_EXPERIMENTAL_FILESYSTEM_DEPRECATION_WARNING


#include "core/winheader.h"

#include "minhook/MinHook.h"

#include <dxgitype.h>

__pragma(warning(push))
__pragma(warning(disable:4005))

#include <dxgi.h>
#include <d3d11.h>
#include <D3DCompiler.h>

#include "dxgi1_2.h"
__pragma(warning(pop))


#include <Wincodec.h>

#include <assert.h>
#include <memory>

#define STORM_NONCOPYABLE(classname)\
    classname(const classname &) = delete; \
    classname &operator=(const classname &) = delete;

namespace Storm {
    class RunloopTaskQueue;
    typedef std::shared_ptr<RunloopTaskQueue> RunloopTaskQueuePtr;
}
#include "core/syncqueue.h"
#include "core/dbg.h"
#include "core/timetick.h"
#include "core/utils.hpp"
#include "core/dbgconsole.h"
#include "core/comptr.h"
#include "core/weakobjectptr.h"
#include "core/func.h"
#include "core/callback.h"
#include "core/delegate.h"
#include "core/event.h"

namespace Storm {
    typedef Storm::Callback<void()>  Callback0;
    class ThreadDispatcher;
    typedef std::shared_ptr<ThreadDispatcher> ThreadDispatcherPtr;
}

#include "core/lock.h"
#include "core/corerunlooptaskqueue.h"
#include "core/corerunloopsafe.h"

namespace Storm {
    typedef std::shared_ptr<CoreRunloopSafe> CoreRunloopSafePtr;
}

#include "core/corerunloop.h"
#include "core/corethread.h"

#include "core/dispatcher.h"

#include "core/share_mem.h"

#include "geometry.h"

#include "common.hpp"

#include "hook/apihook.hpp"
#include "graphics/graphics.h"



#ifndef ReleaseCOM
#	define ReleaseCOM(p) {if (NULL != (p)) {(p)->Release(); (p) = NULL;}}
#endif

#define __trace__ std::cout << std::endl << __FUNCTION__
