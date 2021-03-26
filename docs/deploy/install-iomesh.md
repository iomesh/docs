---
id: install-iomesh
title: Install IOMesh
sidebar_label: Install IOMesh
---

## Quick Installation Guide

Choose the right script to execute according to your OS distribution.

> **_NOTE_: Helm3 would be installed automatically if it is not founded.**

<!--DOCUSAURUS_CODE_TABS-->

<!--RHEL7/CentOS7-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://raw.githubusercontent.com/iomesh/docs/master/scripts/install_iomesh_el7.sh | sh -
```

<!--RHEL8/CentOS8/CoreOS-->

```shell
# Every node running IOMesh must have an IP address belongs to IOMESH_DATA_CIDR
export IOMESH_DATA_CIDR=10.234.1.0/24; curl -sSL https://raw.githubusercontent.com/iomesh/docs/master/scripts/install_iomesh_el8.sh | sh -
```
<!--END_DOCUSAURUS_CODE_TABS-->

Then wait until all IOMesh Cluster pods get ready.

```shell
watch kubectl get --namespace iomesh-system pods
```

Now IOMesh has been installed successfully!

## Customized Installation Guide

This is the sophisticated installtion guide for customized configurations.

### Install Snapshot Controller

Install Snapshot Controller for creating snapshot of volumes.
There should be **only one instance** of Snapshot Controller running in the Kubernetes cluster.

1. Download and extract **[Kubernetes CSI external-snapshotter](https://github.com/kubernetes-csi/external-snapshotter/tree/release-2.1)**

```shell
curl -LO https://github.com/kubernetes-csi/external-snapshotter/archive/release-2.1.zip
unzip release-2.1.zip && cd external-snapshotter-release-2.1
```

2. Create Snapshot Controller CRD

```shell
kubectl create -f ./config/crd
```

3. Modify `deploy/kubernetes/snapshot-controller/setup-snapshot-controller.yaml` by adding a namespace, eg. `kube-system`.

```yaml
kind: StatefulSet
apiVersion: apps/v1
metadata:
  name: snapshot-controller
  namespace: kube-system # <-- Add namespace here
# ...
```

4. Modify `deploy/kubernetes/snapshot-controller/rbac-snapshot-controller.yaml` by adding a namespace. eg. `kube-system`

```yaml
apiVersion: v1
kind: ServiceAccount
metadata:
  name: snapshot-controller
  namespace: kube-system # <-- Add namespace here
# ...
```

5. Install Snapshot Controller

```shell
kubectl apply -f ./deploy/kubernetes/snapshot-controller
```

6. Verify the status of snapshot-controller installation

```shell
kubectl get sts snapshot-controller -n kube-system
```

```output
NAME                  READY   AGE
snapshot-controller   1/1     32s
```

### Install Helm3

Note: You may skip this step if Helm3 is already installed.

```shell
curl -fsSL -o get_helm.sh https://raw.githubusercontent.com/helm/helm/master/scripts/get-helm-3
chmod 700 get_helm.sh
./get_helm.sh
```

Please refer to **[Install Helm](https://helm.sh/docs/intro/install/)** for more details.


### Setup Helm Repo

```shell
helm repo add iomesh http://iomesh.com/charts
```

### Install IOMesh Operator

1. Download `iomesh-operator.yaml` with default configurations.

```shell
helm show values iomesh/operator > iomesh-operator.yaml
```

2. Customize the `iomesh-operator.yaml`.

3. Install IOMesh Operator

> **_NOTE_: replace `my-iomesh-operator` with your release name.**
```shell
helm install my-iomesh-operator iomesh/operator \
	       	--namespace iomesh-system \
	       	--create-namespace \
	       	--wait
```

4. Wait until IOMesh Operator gets ready

```shell
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh Cluster

1. Download `iomesh-values.yaml` with default configurations.

```shell
helm show values iomesh/iomesh > iomesh-values.yaml
```

2. Customize the `iomesh-values.yaml`.

```yaml
chunk:
  dataCIDR: "10.234.1.0/24" # change to data network CIDR
```

3. Install IOMesh Cluster.

> **_NOTE_: replace `my-iomesh` with your release name.**

```shell
helm install my-iomesh iomesh/iomesh \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-values.yaml \
    --wait
```

4. Wait until IOMesh Cluster pod gets ready.

```
watch kubectl get --namespace iomesh-system pods
```

### Install IOMesh CSI driver

1. Download `iomesh-csi-driver.yaml` with default configurations.

```shell
helm show values iomesh/csi-driver > iomesh-csi-driver.yaml
```

2. Customize `iomesh-csi-driver.yaml`

If Kubernetes worker node is installed with `CentOS8` or `CoreOS`, please set `mountIscsiLock` to `true`

```yaml
driver:
  node:
    driver:
      mountIscsiLock: true
```

3. Install IOMesh CSI driver

> **_NOTE_: replace `my-iomesh-csi-driver` with your release name.**

```shell
helm install my-iomesh-csi-driver iomesh/csi-driver \
    --create-namespace \
    --namespace iomesh-system \
    --values iomesh-csi-driver.yaml \
    --wait
```

4. Wait until IOMesh Cluster pod gets ready.

```
watch kubectl get --namespace iomesh-system pods
```

[1]: http://iomesh.com/charts
[2]: http://www.iomesh.com/docs/installation/setup-iomesh-storage#setup-data-network
