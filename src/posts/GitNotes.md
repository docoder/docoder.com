---
title: Git Notes
date: "2016-05-19"
---

# 初级

## git init
初始化一个空仓库

```sh
git init
```

## git config
配置「用户名」和「邮箱」

```sh
git config --global user.name "docoder"
git config --global user.email "docoder@163.com"
git config —list
git config user.email

```

## git help

```sh
git help commit
```

## git status
- untracked : 新增的文件，Git 不知道它的存在
- not staged : 被索引过又被修改了的文件
- staged : 通过 git add 后被即将被提交的文件

```sh
git status
```

## git log

```sh
git log
git log --oneline
git log --oneline --decorate
```

## .gitignore
用 ! 来对模式取反

```sh
*.a
!lib.a
```

## git add

```sh
git add README
git add --all .
git add .
git add -A
```

## git tag

```sh
git tag new_tag
git tag -d deleteTag

#git push 命令默认是不会 push Tags 的，需要加参数。
git push --tags

#添加远程 Tag 0.0.2
git push origin 0.0.2
#删除远程 Tag 0.0.1
git push origin :0.0.1
```

## git rm

```sh
git rm deleteme.js

#从 staging area 中移除出来，但不删除文件
git rm deleteme.js --cached
```

## git mv

```sh
git mv oldfile.txt newfile.txt
git mv *.html src/
```

## git merge
```sh
git merge feature_branch

```

## git commit

```sh
git commit -m "Add README"
git commit .
git commit -a
git commit -am "This is our first commit"

#追加提交
git commit --amend
#修改提交日期
git commit -m "Commit your changes with the future date" --date '2018-04-05 23:59:59'
```

## git branch

```sh
git branch test_branch

git checkout -b my_branch

#删除分支
git branch -d delete_branch

#有时忘记开新的分支，就修改并提交了代码。开分支的时候默认是基于最新的一次提交的，但我们也可以指定参数使其基于任一次提交。
git branch test_branch HEAD~1
```

## git remote

remote 对应远端仓库 

```sh
git remote add origin https://github.com/docoder/docoder.github.io
git remote
git remote -v
git remote rm origin
```

## git clone

```sh
git clone https://github.com/docoder/docoder.github.io
git clone https://github.com/docoder/docoder.github.io myname.github.io
```

## git checkout

```sh
git checkout config.js

git checkout -b my_branch

#checkout tag 和分支没有什么区别
git checkout v1.2

#当存在同名的 tag 和分支时,分支优先级高，所以要显式地告诉 git 我们是要切换到 tag
git checkout tags/v1.2 
```

## git fetch

```sh
#用 fetch 命令把代码拿下来,但并不合并到本地仓库
git fetch origin
```

## git pull
将别人提交的代码，拉到本地

```sh
git pull origin master
```

## git diff

```sh
git diff
```

## git push

```sh
#把分支 push 到远程仓库中去
git push origin test_branch
```

## git reset

```sh
git reset to_commit_second.js

#`HEAD~1` 倒数第二的位置
#`--soft` 把变更保持在 staging area
git reset HEAD~1 --soft
```

# 高级 

## git stash
把当前未提交的改动「复制」到另一个地方暂存起来，待要恢复的时候执行 `git stash pop` 即可

```sh
git stash
git stash pop
```

## git add

```sh
# Open the diff vs. the index in an editor and let the user edit it. After the editor was closed, adjust the hunk headers and apply the patch to the index.
git add -e
```

## git merge

```sh
#将long-feature-branch的所有commit 合成一个commit 到本分支
git merge long-feature-branch --squash
	git commit
	
	
#解决冲突
git merge mybranch
	#(CONFLICT (content): Merge conflict in poem.txt)
	vim poem.txt
	#(解决冲突的地方为你想要的正确的代码)
	git add poem.txt
	git commit
	#(可以修改message也可以不修改，保存)
```

## git rebase

```sh
git rebase

#将feature分支rebase到master上
git rebase master feature

#修改 commit message
git rebase -i HEAD~~ 
	#(将要修改的commit的前面的 pick 改成 edit 后保存)
	git commit --amend
	#(修改 commit message 后保存)
	git rebase --continue
	
#合并commit
git rebase -i HEAD~4
	#(将要合并的commit的前面的 pick 都改成 squash 后保存 )
	#(可以修改message也可以不修改，保存)

#拆分commit
git rebase -i HEAD^
	#(将`updated README formatting and added blame`拆分为：第一次为 `updated README formatting`，第二次为 `added blame`)
	#(将要拆分的commit的前面的 pick 改成 edit 后保存 )
	git add README
	git commit -m 'updated README formatting'
	git add lib/simplegit.js
	git commit -m 'added blame'
	git rebase --continue

#调整commit的顺序
git rebase -i HEAD~3
	#(将 pick 的 commit 和其 message 的顺序改成你的要求，后保存)
	
```

## git cherry-pick

```sh
#将其他分支的提交（ca32a6d）拿过来到本分支
git cherry-pick ca32a6d
```

## git revert

```sh
#撤销 某次操作，此次操作之前和之后的commit和history都会保留，并且把这次撤销作为一次最新的提交
#撤销前一次 commit
git revert HEAD
#撤销前前一次 commit
git revert HEAD^
#撤销指定的commit，撤销也会作为一次提交进行保存
git revert 7ab60ed
```


## git grep

```sh
#查找每个包含有字符串`searchStr`的地方
git grep searchStr

#`-n` 显示行号
git grep -n searchStr

#`--name-only` 只显示文件名
git grep --name-only searchStr

#查找仓库里某个特定版本(标签名tag reference:`v1.5.0`)里的内容
git grep searchStr v1.5.0

#`-c` 查看每个文件里有多少行匹配的内容 (统计每个文件有多少的TODO)
git grep -c TODO 

#哪个地方定义了宏(`#define`):`SORT_DIRENT`
git grep -e '#define' --and -e SORT_DIRENT

#名字中含有`PATH`或是`MAX`的宏(`#define`)定义
git grep -e '#define' --and \( -e PATH -e MAX \)

#哪个地方含有`MAX`或是`MIN`
git grep --all-match -e MAX -e MIN
```

## git reflog

```sh
git reflog

#Restore the deleted commit
git reflog
	git reset --hard 18cbf98
```

## git submodule

```sh
git submodule add https://github.com/jackmaney/githug-include-me ./githug-include-me
```

## git blame
快速找到某行代码最后的修改者,追责

```sh
git blame config.js
```

## git repack

```sh
#Optimise how your repository is packaged ensuring that redundant packs are removed.
git repack -d
```

## git bisect
Bisect 就是利用二分查找发来查找在你的某一分支中到底是哪一次提交引入了特定的变更(通常为检测bug)

首先，要用方法检测出一个给定的提交点是不是有 bug，可以写个测试代码或脚本

```sh
#开始 bisect
git bisect start
#没有得到想要的结果（就是没有任何输出），所以我们把它标记为坏的，作为终点。
git bisect bad

#指定一个好的提交点：假设第一个提交点（80a9b3d）是没有 bug 的，作为起点。
git bisect good 80a9b3d

#运行自动化脚本 `test.sh`
	git bisect run ./test.sh
#或 运行make脚本 `test`
	git bisect run make test
#(脚本，正确的返回 0，反之返回 1)
#如：test.sh:

if [[ `grep 1013 file.txt` ]]; then
  exit 1
else
  exit 0
fi
```

## git filter-branch

```sh
#让trunk子目录成为每一次提交的新的项目根目录
$ git filter-branch --subdirectory-filter trunk HEAD

#全局性地更换电子邮件地址
git filter-branch --commit-filter ' 
	if [ "$GIT_AUTHOR_EMAIL" = "schacon@localhost" ]; 
	then 
		GIT_AUTHOR_NAME="Scott Chacon";
		GIT_AUTHOR_EMAIL="schacon@example.com"; 
		git commit-tree "$@"; 
	else 
		git commit-tree "$@"; 
	fi' HEAD
```