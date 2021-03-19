---
id: install-and-setup-iomesh
title: Install and Setup IOMesh
sidebar_label: Install and Setup IOMesh
---

IOMesh using IOMesh Operator to manage the IOMesh Cluster. IOMesh Operator will watch-and-list IOMeshCluster CR. When CR changes, IOMesh Operator will perform some corresponding operations, such as deployment/uninstallation/scaling, etc.

## Supported Platforms

- Kubernetes v1.17 or higher, check [Compatibility list](https://iomesh.com/docs/zbs-operator/overview#compatibility-list-with-kubernetes)
- Helm 3

## Setup Helm

Please refer to **[Install Helm](https://helm.sh/docs/intro/install/)**

> If it's not allowed to install on the Kubernetes Node, install helm locally.

```bash
$ curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
$ chmod 700 get_helm.sh
$ ./get_helm.sh
```

## Install IOMesh Cluster

Follow the steps below to install a IOMesh Cluster.

1. Add [IOMesh Helm Repo][1]

```bash
helm repo add iomesh iomesh.com/charts
```

2. Prepare hostpath dir

IOMesh Operator will deploy hostpath-provisioner who manages local storage in pvc/pv way.  IOMesh Operator will use hostpath-provisioner'pv to deploy IOMesh cluster.

```bash
# Execute the following commands on each worker node
mkdir -p /mnt/iomesh/hostpath
mount /dev/<formatted-partition> /mnt/iomesh/hostpath
```

> **_NOTE_: append a fstab entry to `/etc/fstab` to persist hostpath's mount operation.**

3. Install iomesh chart

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm install --namespace iomesh-system --create-namespace my-iomesh iomesh/iomesh --set hostpath-provisioner.pvDir=/mnt/iomesh/hostpath
```

4. Check your installation and wait for IOMesh Cluster pods all ready

```bash
watch kubectl get --namespace iomesh-system pods
```

> **_NOTE_: `chunk` server may fall in `CrashLoop`, because it need [setup data network][2]**

## Customize IOMesh Cluster

The basic install only make the cluster run. If you want to change some config of the cluster, such as image url, tolerations or mount device etc. You can follow the step to customize your own IOMesh Cluster

1. Export default `iomesh-values.yaml` of IOMesh Cluster chart

```bash
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Edit the `iomesh-values.yaml` with any text editor you love

3. If you already installed the IOMesh Cluster, you can update it

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm upgrade --namespace iomesh-system my-iomesh iomesh/iomesh --values iomesh-values.yaml
```

4. Or, you want to install a new IOMesh Cluster

> **_NOTE_: `my-iomesh` is release name, maybe you want to modify it.**

```bash
helm install \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-values.yaml \
    --set hostpath-provisioner.pvDir=/mnt/iomesh/hostpath \
    my-iomesh \
    iomesh/iomesh
```

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network